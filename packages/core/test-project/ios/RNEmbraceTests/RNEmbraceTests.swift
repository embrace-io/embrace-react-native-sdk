import XCTest
import EmbraceIO
@testable import RNEmbrace


final class EmbraceManagerTests: XCTestCase {
  var module: EmbraceManager!;

  override func setUp() {
    module = EmbraceManager();
  }

  func testBasic()  {
    XCTAssertEqual(1, 1)
  }
}
