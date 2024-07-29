import Foundation
import OSLog
import OpenTelemetryApi

// Should not get hit under normal circumstances, add as a guard against misinstrumentation
private let MAX_STORED_SPANS = 10000

class SpanRepository {
    private let activeSpansQueue = DispatchQueue(label: "io.embrace.RNEmbrace.activeSpans",
                                                 attributes: .concurrent)
    private let completedSpansQueue = DispatchQueue(label: "io.embrace.RNEmbrace.completedSpans",
                                                    attributes: .concurrent)
    private var activeSpans = [String: Span]()
    private var completedSpans = [String: Span]()
    private var log = OSLog(subsystem: "Embrace", category: "SpanRepository")

    init() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(onSessionEnded),
            name: Notification.Name("embrace.session.will_end"),
            object: nil
        )
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    private func getKey(_ span: Span) -> String {
        return "\(span.context.spanId.hexString)_\(span.context.traceId.hexString)"
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

    func spanStarted(span: Span) -> String {
        let key = getKey(span)

        if activeSpans.count > MAX_STORED_SPANS {
            os_log("too many active spans being tracked, ignoring", log: log, type: .error)
            return ""
        }

        activeSpansQueue.async(flags: .barrier) {
            self.activeSpans.updateValue(span, forKey: key)
        }

        return key
    }

    func spanEnded(span: Span) {
        let key = getKey(span)

        activeSpansQueue.async(flags: .barrier) {
            self.activeSpans.removeValue(forKey: key)
        }

        if completedSpans.count > MAX_STORED_SPANS {
            os_log("too many completed spans being tracked, ignoring", log: log, type: .error)
            return
        }

        completedSpansQueue.async(flags: .barrier) {
            self.completedSpans.updateValue(span, forKey: key)
        }
    }

    @objc func onSessionEnded() {
        completedSpansQueue.async(flags: .barrier) {
            self.completedSpans.removeAll()
        }
    }
}
