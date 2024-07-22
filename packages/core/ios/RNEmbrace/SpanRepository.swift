import Foundation
import OpenTelemetryApi

class SpanRepository {
    private var activeSpans = [String: Span]()
    private var completedSpans = [String: Span]()

    func get(spanId: String) -> Span? {
        return nil
    }
    
    func spanStarted(span: Span) {
        
    }
    
    func spanEnded(span: Span) {
        
    }
    
    func sessionEnded() {
        
    }
}
