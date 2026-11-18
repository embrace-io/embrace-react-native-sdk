import React
import JavaScriptCore
import Foundation
import EmbraceIO
import OpenTelemetryApi
import os

private typealias OpenTelemetryAttributes = [String: OpenTelemetryApi.AttributeValue]

private let LINK_ATTRIBUTES_KEY = "attributes"
private let LINK_SPAN_CONTEXT_KEY = "context"
private let SPAN_CONTEXT_TRACE_ID_KEY = "traceId"
private let SPAN_CONTEXT_SPAN_ID_KEY = "spanId"
private let SPAN_STATUS_CODE_KEY = "code"
private let SPAN_STATUS_MESSAGE_KEY = "message"
private let EMB_TYPE_KEY = "emb.type"

// Should not get hit under normal circumstances, add as a guard against misinstrumentation
private let MAX_STORED_SPANS = 10000

private enum SpanPath {
  case otel(TracerProvider)
  case embrace
}

private enum BridgedTracer {
  case otel(Tracer)
  case embrace
}

private enum BridgedSpan {
  case otel(Span)
  case embrace(EmbraceSpan)
  case dropped

  var traceId: String {
    switch self {
    case .otel(let span):
      return span.context.traceId.hexString
    case .embrace(let span):
      return span.context.traceId
    case .dropped:
      return ""
    }
  }

  var spanId: String {
    switch self {
    case .otel(let span):
      return span.context.spanId.hexString
    case .embrace(let span):
      return span.context.spanId
    case .dropped:
      return ""
    }
  }
}

@objc(EmbraceTracerProviderImpl)
public class EmbraceTracerProvider: NSObject {
  private let tracersQueue = DispatchQueue(
    label: "io.embrace.rnembracecore.tracerprovider.tracers",
    attributes: .concurrent
  )
  private let activeSpansQueue = DispatchQueue(
    label: "io.embrace.rnembracecore.tracerprovider.activeSpans",
    attributes: .concurrent
  )
  private let completedSpansQueue = DispatchQueue(
    label: "io.embrace.rnembracecore.tracerprovider.completedSpans",
    attributes: .concurrent
  )
  private var tracers = [String: BridgedTracer]()
  private var activeSpans = [String: BridgedSpan]()
  private var completedSpans = [String: BridgedSpan]()
  private var spanPath: SpanPath?
  private let allowsOTelBridge: Bool
  private var log = OSLog(subsystem: "Embrace", category: "EmbraceTracerProvider")

  init(allowsOTelBridge: Bool) {
    self.allowsOTelBridge = allowsOTelBridge
    super.init()
  }

  public override convenience init() {
    self.init(allowsOTelBridge: true)
  }

  /**
   * Various deserializer helpers to go to and from NSDictionary / NSArray to
   * actual OTEL API objects
   */
  private func attributesFrom(dict: NSDictionary) -> OpenTelemetryAttributes {
    var attributes = OpenTelemetryAttributes()

    for (key, value) in dict {
      if let key = key as? String {
        if let value = value as? String {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else if let value = value as? Bool {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else if let value = value as? Int {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else if let value = value as? Double {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else if let value = value as? [String] {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else if let value = value as? [Bool] {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else if let value = value as? [Int] {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else if let value = value as? [Double] {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else {
          os_log("invalid attribute for key:%@", log: log, type: .error, key)
          continue
        }
      } else {
        os_log("invalid attribute key", log: log, type: .error)
        continue
      }
    }

    return attributes
  }

  private func embraceAttributesFrom(dict: NSDictionary) -> EmbraceAttributes {
    return attributesFrom(dict: dict).mapValues { value -> EmbraceAttributeValue in
      switch value {
      case .string(let value):
        return value
      case .bool(let value):
        return value
      case .int(let value):
        return value
      case .double(let value):
        return value
      default:
        return value.description
      }
    }
  }

  private func embraceLinksFrom(array: NSArray) -> [EmbraceSpanLink] {
    return array.compactMap { link in
      guard let link = link as? NSDictionary else {
        return nil
      }

      guard let context = link.value(forKey: LINK_SPAN_CONTEXT_KEY) as? NSDictionary,
            let traceId = context.value(forKey: SPAN_CONTEXT_TRACE_ID_KEY) as? String,
            let spanId = context.value(forKey: SPAN_CONTEXT_SPAN_ID_KEY) as? String else {
        os_log("invalid span context for link", log: log, type: .error)
        return nil
      }

      let attributes = (link.value(forKey: LINK_ATTRIBUTES_KEY) as? NSDictionary)
        .map { embraceAttributesFrom(dict: $0) } ?? [:]

      return EmbraceSpanLink(spanId: spanId, traceId: traceId, attributes: attributes)
    }
  }

  private func spanContextFrom(dict: NSDictionary) -> SpanContext? {
    let traceId = dict.value(forKey: SPAN_CONTEXT_TRACE_ID_KEY)
    let spanId = dict.value(forKey: SPAN_CONTEXT_SPAN_ID_KEY)

    if let traceId = traceId as? String, let spanId = spanId as? String {
      return SpanContext.create(
        traceId: TraceId(fromHexString: traceId),
        spanId: SpanId(fromHexString: spanId),
        traceFlags: TraceFlags(),
        traceState: TraceState()
      )
    } else {
      return nil
    }
  }

  private func spanContextToDict(span: BridgedSpan) -> NSDictionary {
    return NSDictionary(dictionary: [
      SPAN_CONTEXT_TRACE_ID_KEY: span.traceId,
      SPAN_CONTEXT_SPAN_ID_KEY: span.spanId
    ])
  }

  private func dateFrom(ms: Double) -> Date {
    return Date(timeIntervalSince1970: TimeInterval(ms / 1000.0))
  }

  private func dateOrNowFrom(ms: Double) -> Date {
    return ms.isZero ? Date() : dateFrom(ms: ms)
  }

  private func getTracerKey(name: String, version: String, schemaUrl: String) -> String {
    return "\(name) \(version) \(schemaUrl)"
  }

  private func getSpan(spanBridgeId: String) -> BridgedSpan? {
    var span: BridgedSpan?

    activeSpansQueue.sync {
      span = activeSpans[spanBridgeId]
    }

    if span == nil {
        completedSpansQueue.sync {
            span = completedSpans[spanBridgeId]
        }
    }

    if span == nil {
      os_log("could not retrieve span with id: %@", log: log, type: .error, spanBridgeId)
    }

    return span
  }

  private func startOTelSpan(tracer: Tracer, name: String, kind: String, time: Double,
                             attributes: NSDictionary, links: NSArray, parentId: String) -> Span {
    let spanBuilder = tracer.spanBuilder(spanName: name)

    // Set kind
    if !kind.isEmpty {
      if let spanKind = SpanKind(rawValue: kind.lowercased()) {
        spanBuilder.setSpanKind(spanKind: spanKind)
      } else {
        os_log("invalid kind for startSpan: %@", log: log, type: .error, kind)
      }
    }

    // Set time
    if !time.isZero {
      spanBuilder.setStartTime(time: dateFrom(ms: time))
    }

    // Set attributes
    for (key, value) in attributesFrom(dict: attributes) {
      spanBuilder.setAttribute(key: key, value: value)
    }

    // Set links
    for link in links {
      if let link = link as? NSDictionary {
        let linkSpanContext = link.value(forKey: LINK_SPAN_CONTEXT_KEY)
        let linkAttributes = link.value(forKey: LINK_ATTRIBUTES_KEY)

        if let linkSpanContext = linkSpanContext as? NSDictionary,
           let spanContext = spanContextFrom(dict: linkSpanContext) {
          if linkAttributes != nil, let linkAttributes = linkAttributes as? NSDictionary, linkAttributes.count > 0 {
            spanBuilder.addLink(spanContext: spanContext, attributes: attributesFrom(dict: linkAttributes))
          } else {
            spanBuilder.addLink(spanContext: spanContext)
          }
        } else {
          os_log("invalid span context for link", log: log, type: .error)
          continue
        }
      }
    }

    // Set parent
    if !parentId.isEmpty, case .otel(let parent)? = getSpan(spanBridgeId: parentId) {
      spanBuilder.setParent(parent)
    } else {
      spanBuilder.setNoParent()
    }

    return spanBuilder.startSpan()
  }

  private func startEmbraceSpan(name: String, time: Double, attributes: NSDictionary,
                                links: NSArray, parentId: String) -> BridgedSpan {
    let spanAttributes = embraceAttributesFrom(dict: attributes)
    let type = (spanAttributes[EMB_TYPE_KEY] as? String).flatMap { EmbraceType(rawValue: $0) } ?? .performance

    var parent: EmbraceSpan?
    if !parentId.isEmpty, case .embrace(let parentSpan)? = getSpan(spanBridgeId: parentId) {
      parent = parentSpan
    }

    let span = EmbraceIO.shared.createSpan(
      name: name,
      parentSpan: parent,
      type: type,
      startTime: dateOrNowFrom(ms: time),
      links: embraceLinksFrom(array: links),
      attributes: spanAttributes
    )

    if let span = span {
      return .embrace(span)
    }

    return .dropped
  }

  /**
   * Methods to allow the JS side to conform to @opentelemetry-js/api
   */

  @objc(setupTracer:version:schemaUrl:)
  public func setupTracer(name: String, version: String, schemaUrl: String) {
    if spanPath == nil {
        guard EmbraceIO.shared.state == .started else {
            os_log("cannot access tracer provider, Embrace SDK has not been started", log: log, type: .error)
            return
        }

        if allowsOTelBridge, let provider = EmbraceIO.shared.tracerProvider {
            spanPath = .otel(provider)
        } else {
            spanPath = .embrace
        }
    }

    let id = getTracerKey(name: name, version: version, schemaUrl: schemaUrl)
    var existingTracer: BridgedTracer?

    tracersQueue.sync {
      existingTracer = tracers[id]
    }

    if existingTracer != nil {
      return
    }

    let tracer: BridgedTracer
    switch spanPath {
    case .otel(let provider):
      // No current way to set schemaURL in the OTEL Swift API, ignoring
      tracer = .otel(provider.get(instrumentationName: name, instrumentationVersion: version))
    case .embrace, nil:
      tracer = .embrace
    }

    tracersQueue.async(flags: .barrier) {
      self.tracers.updateValue(tracer, forKey: id)
    }
  }

  @objc(startSpan:tracerVersion:tracerSchemaUrl:spanBridgeId:name:kind:time:attributes:links:parentId:resolve:reject:)
  public func startSpan(tracerName: String, tracerVersion: String, tracerSchemaUrl: String,
                        spanBridgeId: String, name: String, kind: String, time: Double,
                        attributes: NSDictionary, links: NSArray, parentId: String,
                        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let tracerKey = getTracerKey(name: tracerName, version: tracerVersion, schemaUrl: tracerSchemaUrl)
    var tracer: BridgedTracer?

    tracersQueue.sync {
      tracer = tracers[tracerKey]
    }

    let span: BridgedSpan
    switch tracer {
    case .otel(let tracer):
      span = .otel(startOTelSpan(tracer: tracer, name: name, kind: kind, time: time,
                                 attributes: attributes, links: links, parentId: parentId))
    case .embrace:
      span = startEmbraceSpan(name: name, time: time, attributes: attributes, links: links, parentId: parentId)
    case nil:
      reject("START_SPAN", "tracer not found", nil)
      return
    }

    activeSpansQueue.async(flags: .barrier) {
        if self.activeSpans.count > MAX_STORED_SPANS {
          os_log("too many active spans being tracked, ignoring", log: self.log, type: .error)
          reject("START_SPAN", "too many active spans being tracked, ignoring", nil)
        } else {
          self.activeSpans.updateValue(span, forKey: spanBridgeId)
          resolve(self.spanContextToDict(span: span))
        }
    }
  }

  @objc(setAttributes:attributes:)
  public func setAttributes(spanBridgeId: String, attributes: NSDictionary) {
    switch getSpan(spanBridgeId: spanBridgeId) {
    case .otel(let span):
      for (key, value) in attributesFrom(dict: attributes) {
        span.setAttribute(key: key, value: value)
      }
    case .embrace(let span):
      for (key, value) in embraceAttributesFrom(dict: attributes) {
        span.setAttribute(key: key, value: value)
      }
    case .dropped, nil:
      break
    }
  }

  @objc(addEvent:eventName:attributes:time:)
  public func addEvent(spanBridgeId: String, eventName: String, attributes: NSDictionary, time: Double) {
    switch getSpan(spanBridgeId: spanBridgeId) {
    case .otel(let span):
      if time.isZero {
        span.addEvent(name: eventName, attributes: attributesFrom(dict: attributes))
      } else {
        span.addEvent(name: eventName, attributes: attributesFrom(dict: attributes), timestamp: dateFrom(ms: time))
      }
    case .embrace(let span):
      span.addEvent(name: eventName, type: nil, timestamp: dateOrNowFrom(ms: time),
                    attributes: embraceAttributesFrom(dict: attributes))
    case .dropped, nil:
      break
    }
  }

  @objc(addLinks:links:)
  public func addLinks(spanBridgeId: String, links: NSArray) {
    switch getSpan(spanBridgeId: spanBridgeId) {
    case .otel:
      // not supported by the OTEL Swift API currently
      os_log("adding links is not currently supported", log: log, type: .error)
    case .embrace(let span):
      for link in embraceLinksFrom(array: links) {
        span.addLink(link)
      }
    case .dropped, nil:
      break
    }
  }

  @objc(setStatus:status:)
  public func setStatus(spanBridgeId: String, status: NSDictionary) {
    guard let span = getSpan(spanBridgeId: spanBridgeId),
          let code = status.value(forKey: SPAN_STATUS_CODE_KEY) as? String else {
      return
    }

    let message = status.value(forKey: SPAN_STATUS_MESSAGE_KEY) as? String ?? ""

    switch (span, code) {
    case (.otel(let span), "UNSET"):
      span.status = .unset
    case (.otel(let span), "OK"):
      span.status = .ok
    case (.otel(let span), "ERROR"):
      span.status = .error(description: message)
    case (.embrace(let span), "UNSET"):
      span.setStatus(.unset)
    case (.embrace(let span), "OK"):
      span.setStatus(.ok)
    case (.embrace(let span), "ERROR"):
      span.setStatus(.error)
    case (.dropped, _):
      break
    default:
      os_log("invalid status for setStatus: %@", log: log, type: .error, code)
    }
  }

  @objc(updateName:name:)
  public func updateName(spanBridgeId: String, name: String) {
    switch getSpan(spanBridgeId: spanBridgeId) {
    case .otel(let span):
      span.name = name
    case .embrace:
      os_log("updating a span name requires the Embrace SDK to be started with OTel options", log: log, type: .error)
    case .dropped, nil:
      break
    }
  }

  @objc(endSpan:time:)
  public func endSpan(spanBridgeId: String, time: Double) {
    guard let span = getSpan(spanBridgeId: spanBridgeId) else {
      return
    }

    switch span {
    case .otel(let span):
      if time.isZero {
        span.end()
      } else {
        span.end(time: dateFrom(ms: time))
      }
    case .embrace(let span):
      span.end(endTime: dateOrNowFrom(ms: time))
    case .dropped:
      break
    }

    activeSpansQueue.async(flags: .barrier) {
      self.activeSpans.removeValue(forKey: spanBridgeId)
    }

    completedSpansQueue.async(flags: .barrier) {
      if self.completedSpans.count > MAX_STORED_SPANS {
        os_log("too many completed spans being tracked, ignoring", log: self.log, type: .error)
        return
      }

      self.completedSpans.updateValue(span, forKey: spanBridgeId)
    }
  }

  @objc(clearCompletedSpans)
  public func clearCompletedSpans() {
    completedSpansQueue.async(flags: .barrier) {
      self.completedSpans.removeAll()
    }
  }
 }
