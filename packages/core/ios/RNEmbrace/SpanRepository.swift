import Foundation
import OpenTelemetryApi

class SpanRepository {
    private let activeSpansQueue = DispatchQueue(label: "io.embrace.RNEmbrace.activeSpans", attributes: .concurrent)
    private let completedSpansQueue = DispatchQueue(label: "io.embrace.RNEmbrace.completedSpans", attributes: .concurrent)
    private var activeSpans = [String: Span]()
    private var completedSpans = [String: Span]()

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
        activeSpansQueue.async(flags: .barrier) {
            self.activeSpans.updateValue(span, forKey: span.context.spanId.hexString)
        }
    }
    
    func spanEnded(span: Span) {
        activeSpansQueue.async(flags: .barrier) {
            self.activeSpans.removeValue(forKey: span.context.spanId.hexString)
        }
        
        completedSpansQueue.async(flags: .barrier) {
            self.completedSpans.updateValue(span, forKey: span.context.spanId.hexString)
        }
    }
    
    func sessionEnded() {
        completedSpansQueue.async(flags: .barrier) {
            self.completedSpans.removeAll()
        }

    }
}
