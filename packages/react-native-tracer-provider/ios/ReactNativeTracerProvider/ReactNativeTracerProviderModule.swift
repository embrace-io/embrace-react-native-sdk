import ObjectiveC
import Foundation
import OpenTelemetryApi
import EmbraceIO
import os

/*
 NOTE: There's currently a bit of duplication between this and code in packages/core, particularly https://github.com/embrace-io/embrace-react-native-sdk/blob/7c54b59362adfc93f7f997db89db179950a50e8b/packages/core/ios/RNEmbrace/SpanRepository.swift
 
 The idea will be to have this package power all span features in 6.0 and remove that code from
 the core package so living with the duplication for now
 */

private typealias OpenTelemetryAttributes = [String: OpenTelemetryApi.AttributeValue]

private let LINK_ATTRIBUTES_KEY = "attributes"
private let LINK_SPAN_CONTEXT_KEY = "context"
private let SPAN_CONTEXT_TRACE_ID_KEY = "traceId"
private let SPAN_CONTEXT_SPAN_ID_KEY = "spanId"
private let SPAN_STATUS_CODE_KEY = "code"
private let SPAN_STATUS_MESSAGE_KEY = "message"

// Should not get hit under normal circumstances, add as a guard against misinstrumentation
private let MAX_STORED_SPANS = 10000

@objc(ReactNativeTracerProviderModule)
class ReactNativeTracerProviderModule: NSObject {
  private let tracersQueue = DispatchQueue(
    label: "io.embrace.reactnativetracerprovider.tracers",
    attributes: .concurrent
  )
  private let activeSpansQueue = DispatchQueue(
    label: "io.embrace.reactnativetracerprovider.activeSpans",
    attributes: .concurrent
  )
  private let completedSpansQueue = DispatchQueue(
    label: "io.embrace.reactnativetracerprovider.completedSpans",
    attributes: .concurrent
  )
  private var tracers = [String: Tracer]()
  private var activeSpans = [String: Span]()
  private var completedSpans = [String: Span]()
  private var tracerProvider: TracerProvider!
  private var log = OSLog(subsystem: "Embrace", category: "ReactNativeTracerProviderModule")

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

  private func spanContextToDict(spanContext: SpanContext) -> NSDictionary {
    return NSDictionary(dictionary: [
      SPAN_CONTEXT_TRACE_ID_KEY: spanContext.traceId.hexString,
      SPAN_CONTEXT_SPAN_ID_KEY: spanContext.spanId.hexString
    ])
  }

  private func dateFrom(ms: Double) -> Date {
    return Date(timeIntervalSince1970: TimeInterval(ms / 1000.0))
  }

  private func getTracerKey(name: String, version: String, schemaUrl: String) -> String {
    return "\(name) \(version) \(schemaUrl)"
  }

  private func getSpan(spanBridgeId: String) -> Span? {
    var span: Span?

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

  /**
   * Methods to allow the JS side to conform to @opentelemetry-js/api
   */

  @objc(setupTracer:version:schemaUrl:)
  func setupTracer(name: String, version: String, schemaUrl: String) {
    if tracerProvider == nil {
      if let isStarted = Embrace.client?.started {
        tracerProvider = OpenTelemetry.instance.tracerProvider
      } else {
        os_log("cannot access tracer provider, Embrace SDK has not been started", log: log, type: .error)
        return
      }
    }

    let id = getTracerKey(name: name, version: version, schemaUrl: schemaUrl)
    var existingTracer: Tracer?

    tracersQueue.sync {
      existingTracer = tracers[id]
    }

    if existingTracer != nil {
      return
    }

    // No current way to set schemaURL in the OTEL Swift API, ignoring
    let tracer = tracerProvider.get(instrumentationName: name, instrumentationVersion: version)

    tracersQueue.async(flags: .barrier) {
      self.tracers.updateValue(tracer, forKey: id)
    }
  }

  @objc(startSpan:tracerVersion:tracerSchemaUrl:spanBridgeId:name:kind:time:attributes:links:parentId:resolve:reject:)
  func startSpan(tracerName: String, tracerVersion: String, tracerSchemaUrl: String,
                 spanBridgeId: String, name: String, kind: String, time: Double,
                 attributes: NSDictionary, links: NSArray, parentId: String,
                 resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let tracerKey = getTracerKey(name: tracerName, version: tracerVersion, schemaUrl: tracerSchemaUrl)
    var tracer: Tracer?

    tracersQueue.sync {
      tracer = tracers[tracerKey]
    }

    if tracer == nil {
      reject("START_SPAN", "tracer not found", nil)
      return
    }

    let spanBuilder = tracer!.spanBuilder(spanName: name)

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
    if !parentId.isEmpty, let parent = getSpan(spanBridgeId: parentId) {
      spanBuilder.setParent(parent)
    } else {
      spanBuilder.setNoParent()
    }

    let span = spanBuilder.startSpan()
    activeSpansQueue.async(flags: .barrier) {
        if self.activeSpans.count > MAX_STORED_SPANS {
          os_log("too many active spans being tracked, ignoring", log: self.log, type: .error)
          reject("START_SPAN", "too many active spans being tracked, ignoring", nil)
        } else {
          self.activeSpans.updateValue(span, forKey: spanBridgeId)
          resolve(self.spanContextToDict(spanContext: span.context))
        }
    }
  }

  @objc(setAttributes:attributes:)
  func setAttributes(spanBridgeId: String, attributes: NSDictionary) {
    if let span = getSpan(spanBridgeId: spanBridgeId) {
      for (key, value) in attributesFrom(dict: attributes) {
        span.setAttribute(key: key, value: value)
      }
    }
  }

  @objc(addEvent:eventName:attributes:time:)
  func addEvent(spanBridgeId: String, eventName: String, attributes: NSDictionary, time: Double) {
    if let span = getSpan(spanBridgeId: spanBridgeId) {
      if time.isZero {
        span.addEvent(name: eventName, attributes: attributesFrom(dict: attributes))
      } else {
        span.addEvent(name: eventName, attributes: attributesFrom(dict: attributes), timestamp: dateFrom(ms: time))
      }
    }
  }

  @objc(addLinks:links:)
  func addLinks(spanBridgeId: String, links: NSArray) {
    // not supported by the OTEL Swift API currently
    os_log("adding links is not currently supported", log: log, type: .error)
  }

  @objc(setStatus:status:)
  func setStatus(spanBridgeId: String, status: NSDictionary) {
    if let span = getSpan(spanBridgeId: spanBridgeId),
       let code = status.value(forKey: SPAN_STATUS_CODE_KEY),
       let code = code as? String {
      switch code {
      case "UNSET":
        span.status = .unset
      case "OK":
        span.status = .ok
      case "ERROR":
        if let message = status.value(forKey: SPAN_STATUS_MESSAGE_KEY), let message = message as? String {
          span.status = .error(description: message)
        } else {
          span.status = .error(description: "")
        }
      default:
        os_log("invalid status for setStatus: %@", log: log, type: .error, code)
      }
    }
  }

  @objc(updateName:name:)
  func updateName(spanBridgeId: String, name: String) {
    if let span = getSpan(spanBridgeId: spanBridgeId) {
      span.name = name
    }
  }

  @objc(endSpan:time:)
  func endSpan(spanBridgeId: String, time: Double) {
    if let span = getSpan(spanBridgeId: spanBridgeId) {
      if time.isZero {
        span.end()
      } else {
        span.end(time: dateFrom(ms: time))
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
  }

  @objc(clearCompletedSpans)
  func clearCompletedSpans() {
    completedSpansQueue.async(flags: .barrier) {
      self.completedSpans.removeAll()
    }
  }
 }
