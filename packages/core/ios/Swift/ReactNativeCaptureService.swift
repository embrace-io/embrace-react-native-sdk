import Foundation
import EmbraceIO
#if EMBRACE_USE_SPM
import EmbraceCaptureService
#endif

final class ReactNativeCaptureService: CaptureService {
    static let shared = ReactNativeCaptureService()
}
