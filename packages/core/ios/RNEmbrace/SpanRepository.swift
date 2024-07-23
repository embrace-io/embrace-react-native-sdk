import Foundation
import OpenTelemetryApi

class SpanRepository {
    private let activeSpansQueue = DispatchQueue(label: "io.embrace.RNEmbrace.activeSpans", attributes: .concurrent)
    private let completedSpansQueue = DispatchQueue(label: "io.embrace.RNEmbrace.completedSpans", attributes: .concurrent)
    private var activeSpans = [String: Span]()
    private var completedSpans = [String: Span]()
    
    private func getKey(_ span: Span) -> String {
        // TODO make this a combination of spanId + traceId, spanId not unique on its own
        return span.context.spanId.hexString
    }

    func get(spanId: String) -> Span? {
        var span: Span?
        
        activeSpansQueue.sync {
          span = activeSpans[spanId]
        }
        
        if span == nil {
            completedSpansQueue.sync {
                span = completedSpans[spanId]
            }
        }
        
        return span
    }
    
    func spanStarted(span: Span) {
        let key = getKey(span)
        // TODO guard against this growing out of control
        activeSpansQueue.async(flags: .barrier) {
            self.activeSpans.updateValue(span, forKey: key)
        }
    }
    
    func spanEnded(span: Span) {
        let key = getKey(span)
        
        // TODO guard against this growing out of control
        activeSpansQueue.async(flags: .barrier) {
            self.activeSpans.removeValue(forKey: key)
        }
        
        completedSpansQueue.async(flags: .barrier) {
            self.completedSpans.updateValue(span, forKey: key)
        }
    }
    
    // TODO hook this up to session end handler
    func sessionEnded() {
        completedSpansQueue.async(flags: .barrier) {
            self.completedSpans.removeAll()
        }

    }
}
