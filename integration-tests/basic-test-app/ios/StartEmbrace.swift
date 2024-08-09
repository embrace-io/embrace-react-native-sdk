import Foundation
import EmbraceIO

 @objc(FooWrapper)
 class FooWrapper: NSObject {
 
   @objc
   public func startEmbrace() -> Void {
     
     let builder = CaptureServiceBuilder().addDefaults().remove(ofType: TapCaptureService.self).remove(ofType: ViewCaptureService.self).build()
     
     
     
     DispatchQueue.main.async { try? Embrace.setup(options: .init(appId: "cvKeD", platform: .reactNative, captureServices: builder, crashReporter: nil)).start() }
   }
 }


/*
 public func startEmbrace() -> Void {
 DispatchQueue.main.async { try? Embrace.setup(options: .init(appId: "cvKeD", platform: .reactNative)).start() }
 }
*/
