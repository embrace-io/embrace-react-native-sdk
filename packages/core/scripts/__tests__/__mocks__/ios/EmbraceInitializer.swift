import Foundation
import EmbraceIO

@objcMembers class EmbraceInitializer: NSObject {
    // Start the EmbraceSDK with the minimum required settings, for more advanced configuration options see:
    // https://embrace.io/docs/ios/open-source/integration/embrace-options/
    static func start() -> Void {
        do {
            try EmbraceIO.setup(
                options: .withAppId(
                    "abcde",
                    platform: .reactNative
                )
            )
            try EmbraceIO.shared.start()
        } catch let e {
            print("Error starting Embrace \(e.localizedDescription)")
        }
    }
}
