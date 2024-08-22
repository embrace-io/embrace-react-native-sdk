import Foundation
import EmbraceIO

@objcMembers class EmbraceInitializer: NSObject {
    static func start() -> Void {
        do {
            try Embrace
                .setup(
                    options: Embrace.Options(
                        appId: "abc12",
                        platform: .reactNative
                    )
                )
                .start()
        } catch let e {
            print("Error starting Embrace \(e.localizedDescription)")
        }
    }
}
