import XCTest
import EmbraceIO
@testable import RNEmbrace

final class Promise {
  var resolveCalls: [Bool] = []
  
  func resolve(val: Any?) -> Void {
    if let val = val as? Bool {
      resolveCalls.append(val)
    }
  }
  
  func reject(a: String?, b: String?, c: Error?) -> Void {}
}


final class EmbraceManagerTests: XCTestCase {
  var module: EmbraceManager!;
  var promise: Promise!;

  override func setUp() {
      promise = Promise()
      module = EmbraceManager();
  }

  func testStartNativeEmbraceSDK() async throws {
      module.startNativeEmbraceSDK("myApp", resolve: promise.resolve, rejecter: promise.reject)
      
      try await Task.sleep(nanoseconds: UInt64(5.0 * Double(NSEC_PER_SEC)))
      XCTAssertEqual(promise.resolveCalls.count, 1)
      XCTAssertTrue(promise.resolveCalls[0])
      
      module.isStarted(promise.resolve, rejecter: promise.reject)
      XCTAssertEqual(promise.resolveCalls.count, 2)
      XCTAssertTrue(promise.resolveCalls[1])
  }
}
