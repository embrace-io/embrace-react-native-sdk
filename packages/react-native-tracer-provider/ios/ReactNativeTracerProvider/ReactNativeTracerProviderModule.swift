import ObjectiveC
import Foundation
import OpenTelemetryApi
import EmbraceIO
import os


private typealias OpenTelemetryAttributes = [String : OpenTelemetryApi.AttributeValue]

private let LINK_ATTRIBUTES_KEY = "attributes"
private let LINK_SPAN_CONTEXT_KEY = "context"
private let SPAN_CONTEXT_TRACE_ID_KEY = "traceId"
private let SPAN_CONTEXT_SPAN_ID_KEY = "spanId"
private let SPAN_STATUS_CODE_KEY = "code"
private let SPAN_STATUS_MESSAGE_KEY = "message"


@objc(ReactNativeTracerProviderModule)
class ReactNativeTracerProviderModule: NSObject {
  private let tracersQueue = DispatchQueue(label: "io.embrace.reactnativetracerprovider.tracers", attributes: .concurrent)
  private let spansQueue = DispatchQueue(label: "io.embrace.reactnativetracerprovider.spans", attributes: .concurrent)
  private var tracers = [String: Tracer]()
  private var spans = [String: Span]()
  private var tracerProvider: TracerProvider!;
  private var log = OSLog(subsystem: "Embrace", category: "ReactNativeTracerProviderModule")
  
  override init() {
    super.init()
    
    // Embrace.client?.
    // TODO replace with Embrace OTEL provider from 6.x
    // tracerProvider = OpenTelemetry.instance.tracerProvider
  }
  
  init(withTracerProvider: TracerProvider) {
    super.init()
    tracerProvider = withTracerProvider
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
        } else if let value = value as? Int {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else if let value = value as? Double {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else if let value = value as? Bool {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else if let value = value as? [String] {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else if let value = value as? [Int] {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else if let value = value as? [Double] {
          attributes.updateValue(AttributeValue(value), forKey: key)
        } else if let value = value as? [Bool] {
          // This is missing in the Swift OTEL API currently, should be fixed but in
          // the meantime we can take the string representation since that is what the
          // Embrace SDK will end up doing anyway
          // see: https://github.com/open-telemetry/opentelemetry-swift/blob/31d22dc174530d6f207a102b1ccdecb5938a1b08/Sources/OpenTelemetryApi/Common/AttributeValue.swift#L69
          attributes.updateValue(AttributeValue(value.description), forKey: key)
        } else {
          os_log("invalid attribute for key:%@", log:log, type: .error, key)
          continue
        }
      } else {
        os_log("invalid attribute key", log:log, type: .error)
        continue
      }
    }
    
    return attributes
  }
  
  private func spanContextFrom(dict: NSDictionary) -> SpanContext? {
    let traceId = dict.value(forKey: SPAN_CONTEXT_TRACE_ID_KEY)
    let spanId = dict.value(forKey: SPAN_CONTEXT_SPAN_ID_KEY)
    
    if let traceId = traceId as? String, let spanId = spanId as? String {
      return SpanContext.create(traceId: TraceId(fromHexString: traceId), spanId: SpanId(fromHexString: spanId), traceFlags: TraceFlags(), traceState: TraceState())
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
  
  private func getSpan(id: String) -> Span? {
    var span: Span?
    
    spansQueue.sync {
      span = spans[id]
    }
    
    if span == nil {
      os_log("could not retrieve span with id: %@", log:log, type: .error, id)
    }
    return span
  }

  /**
   * Methods to allow the JS side to conform to @opentelemetry-js/api
   */
  
  @objc(getTracer:version:schemaUrl:)
  func getTracer(name: String, version: String, schemaUrl: String) -> Void {
    let id = getTracerKey(name: name, version: version, schemaUrl: schemaUrl)
    var existingTracer: Tracer?
    
    tracersQueue.sync {
      existingTracer = tracers[id]
    }
    
    if (existingTracer != nil) {
      return
    }
    
    // TODO no current way to set schemaURL in the OTEL Swift API
    let tracer = tracerProvider.get(instrumentationName: name, instrumentationVersion: version)
    
    tracersQueue.async(flags: .barrier) {
      self.tracers.updateValue(tracer, forKey: id)
    }
     
  }
  
  @objc(startSpan:tracerVersion:tracerSchemaUrl:spanBridgeId:name:kind:time:attributes:links:parentId:resolve:reject:)
  func startSpan(tracerName: String, tracerVersion: String, tracerSchemaUrl: String, spanBridgeId: String, name: String, kind: String, time: Double, attributes: NSDictionary, links: NSArray, parentId: String, resolve: @escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    
    
    let instance = OpenTelemetry.instance
    
    /*
    let tracerProvider = instance.tracerProvider
     
     */
    
    
    /*
    
    let tracer = tracerProvider.get(
                instrumentationName: "a_name",
                instrumentationVersion: "1.2.3-versionSemVer"
    )
     */
    
    /*
    let builder = tracer.spanBuilder(spanName: name)
    
    let span = builder.startSpan()
    
    span.end()
     */
    
    
    
    /*
    let tracerKey = getTracerKey(name: tracerName, version: tracerVersion, schemaUrl: tracerSchemaUrl)
    var tracer: Tracer?
    
    tracersQueue.sync {
      tracer = tracers[tracerKey]
    }
    
    if tracer == nil {
      return
    }
    
    let spanBuilder = tracer!.spanBuilder(spanName:name)
    
    // Set kind
    if (!kind.isEmpty) {
      if let spanKind = SpanKind(rawValue: kind.lowercased()) {
        spanBuilder.setSpanKind(spanKind: spanKind)
      } else {
        os_log("invalid kind for startSpan: %@", log:log, type: .error, kind)
      }
    }
    
    // Set time
    if !time.isZero {
      spanBuilder.setStartTime(time: dateFrom(ms:time))
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
        
        if let linkSpanContext = linkSpanContext as? NSDictionary, let spanContext = spanContextFrom(dict: linkSpanContext) {
          if linkAttributes != nil, let linkAttributes = linkAttributes as? NSDictionary, linkAttributes.count > 0 {
            spanBuilder.addLink(spanContext: spanContext, attributes: attributesFrom(dict: linkAttributes))
          } else {
            spanBuilder.addLink(spanContext: spanContext)
          }
        } else {
          os_log("invalid span context for link", log:log, type: .error)
          continue
        }
      }
    }
    
    // Set parent
    if !parentId.isEmpty, let parent = getSpan(id: parentId) {
      spanBuilder.setParent(parent)
    } else {
      spanBuilder.setNoParent()
    }
    
    let span = spanBuilder.startSpan()
    spansQueue.async(flags: .barrier) {
      self.spans.updateValue(span, forKey: spanBridgeId)
      resolve(self.spanContextToDict(spanContext: span.context))
    }
     
     */
  }
   
  @objc(setAttributes:attributes:)
  func setAttributes(spanBridgeId: String, attributes: NSDictionary) -> Void {
    if let span = getSpan(id: spanBridgeId) {
      for (key, value) in attributesFrom(dict: attributes) {
        span.setAttribute(key: key, value: value)
      }
    }
  }
  
  @objc(addEvent:eventName:attributes:time:)
  func addEvent(spanBridgeId: String, eventName: String, attributes: NSDictionary, time: Double) -> Void {
    if let span = getSpan(id: spanBridgeId) {
      if (time.isZero) {
        span.addEvent(name: eventName, attributes: attributesFrom(dict: attributes))
      } else {
        span.addEvent(name: eventName, attributes: attributesFrom(dict: attributes), timestamp: dateFrom(ms: time))
      }
    }
  }
  
  @objc(addLinks:links:)
  func addLinks(spanBridgeId: String, links: NSArray) -> Void {
    // not supported by the OTEL Swift API currently
    os_log("adding links is not currently supported", log:log, type: .error)
  }
  
  @objc(setStatus:status:)
  func setStatus(spanBridgeId: String, status: NSDictionary) -> Void {
    if let span = getSpan(id:spanBridgeId), let code = status.value(forKey: SPAN_STATUS_CODE_KEY), let code = code as? String {
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
        os_log("invalid status for setStatus: %@", log:log, type: .error, code)
      }
    }
  }
  
  @objc(updateName:name:)
  func updateName(spanBridgeId: String, name: String) -> Void {
    if let span = getSpan(id: spanBridgeId) {
      span.name = name
    }
  }
  
  @objc(endSpan:time:)
  func endSpan(spanBridgeId: String, time: Double) -> Void {
    if let span = getSpan(id: spanBridgeId) {
      if time.isZero {
        span.end()
      } else {
        span.end(time: dateFrom(ms: time))
      }
      
      spansQueue.async(flags: .barrier) {
        self.spans.removeValue(forKey: spanBridgeId)
      }
    }
  }
 }
