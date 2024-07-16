import Foundation
import EmbraceIO
import React 

#if canImport(CodePush)
import CodePush
#endif

enum EmbraceKeys: String {
    case reactNativeVersion = "io.embrace.reactnative.version"
    case embraceReactNativeSdkVersion = "io.embrace.reactnative.sdk.version"
    case javaScriptPatchNumber = "io.embrace.javascript.patch"
    case javaScriptBundleURL = "io.embrace.jsbundle.url"
}

@objc(EmbraceManager)
class EmbraceManager: NSObject {
  
  static func moduleName() -> String {
    return "EmbraceManager"
  }

	@objc
	func setJavaScriptBundlePath(_ path: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
			do {
					try Embrace.client?.metadata.addResource(key: EmbraceKeys.javaScriptBundleURL.rawValue, value: path)
					resolve(true) 
			} catch {
					reject(false)
			}
	}

  @objc
  func isStarted(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
    	let embraceStarted = try Embrace.client?.started ?? false
			resolve(embraceStarted)
    } catch {
      reject(false)
    }
  }

	@objc
  func startNativeEmbraceSDK(_ appId: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {

			let embraceOptions = EmbraceOptions(apiKey: appId)
			
			Embrace.setup(options: embraceOptions)
					.start()			

			resolve(true)
    } catch {
      reject(false)
    }
  }

  @objc
  func getDeviceId(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
    	let deviceId = try Embrace.client?.currentDeviceId() ?? nil
			resolve(deviceId)
    } catch {
      reject(nil)
    }
  }
  
	@objc
	func setUserIdentifier(_ userIdentifier: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
			do {
					try Embrace.client?.metadata.userIdentifier = userIdentifier
					resolve(true) 
			} catch {
					reject(false)
			}
	}

	
	@objc
  func getCurrentSessionId(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
    	let sessionId = try Embrace.client?.currentSessionId() ?? nil
			resolve(sessionId)
    } catch {
      reject(nil)
    }
  }

	@objc
	func addBreadcrumb(_ event: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
			do {
					try Embrace.client?.add(event)
					resolve(true) 
			} catch {
					reject(false)
			}
	}

	@objc
	func setReactNativeSDKVersion(_ version: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
			do {
					try Embrace.client?.metadata.addResource(key: EmbraceKeys.embraceReactNativeSdkVersion.rawValue, value: version)
					resolve(true) 
			} catch {
					reject(false)
			}
	}

	
	@objc
	func setUserName(_ userName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
			do {
					try Embrace.client?.metadata.userName = userName
					resolve(true) 
			} catch {
					reject(false)
			}
	}

	@objc
  func clearUserEmail(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
			try Embrace.client?.metadata.userEmail = nil
			resolve(true)
    } catch {
      reject(false)
    }
  }

	@objc
	func setJavaScriptPatchNumber(_ patch: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
			do {
					try Embrace.client?.metadata.addResource(key: EmbraceKeys.javaScriptPatchNumber.rawValue, value: patch)
					resolve(true) 
			} catch {
					reject(false)
			}
	}

	@objc
  func clearUserIdentifier(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
			try Embrace.client?.metadata.userIdentifier = nil
			resolve(true)
    } catch {
      reject(false)
    }
  }

	@objc
  func clearUsername(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
			try Embrace.client?.metadata.userName = nil
			resolve(true)
    } catch {
      reject(false)
    }
  }


	@objc
  func endSession(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
			try Embrace.client?.endSession()
			resolve(true)
    } catch {
      reject(false)
    }
  }

 	@objc
	func checkAndSetCodePushBundleURL(
			_ resolve: @escaping RCTPromiseResolveBlock,
			rejecter reject: @escaping RCTPromiseRejectBlock
	) {
			do {
					#if canImport(CodePush)
					guard let url = try CodePush.bundleURL() else {
							resolve(false)
							return
					}
					
					try Embrace.client?.metadata.addResource(key: EmbraceKeys.javaScriptBundleURL.rawValue, value: url.path)
					resolve(true)
					
					#else
					resolve(false)
					#endif
			} catch {
					resolve(false)
			}
	}

	@objc
  func clearAllUserPersonas(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
			try Embrace.client?.metadata.removeAllPersonaTags()
			resolve(true)
    } catch {
      reject(false)
    }
  }

	@objc
	func setReactNativeVersion(_ version: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
			do {
					try Embrace.client?.metadata.addResource(key: EmbraceKeys.reactNativeVersion.rawValue, value: version)
					resolve(true) 
			} catch {
					reject(false)
			}
	}

	@objc
	func removeSessionProperty(_ key: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
			do {
				// TODO REfactor to include lifespan
					try Embrace.client?.metadata.removeProperty(key: key)
					resolve(true) 
			} catch {
					reject(false)
			}
	}

	@objc
	func setUserEmail(_ userEmail: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
			do {
				// TODO REfactor to include lifespan
					try Embrace.client?.metadata.userEmail = userEmail
					resolve(true) 
			} catch {
					reject(false)
			}
	}
	
	@objc
	func addSessionProperty(
			_ key: String,
			value: String,
			permanent: Bool,
			resolver resolve: @escaping RCTPromiseResolveBlock,
			rejecter reject: @escaping RCTPromiseRejectBlock
	) {
			do {
					let lifespan = permanent ? MetadataRecordLifespan.permanent.rawValue : MetadataRecordLifespan.session.rawValue
					let success = try Embrace.client?.metadata.addProperty(key:key, value:value, lifespan:lifespan) ?? false
					resolve(success)
			} catch {
					resolve(false)
			}
	}

	@objc
  func clearUserPersona(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
			try Embrace.client?.metadata.removePersonaTag()
			resolve(true)
    } catch {
      reject(false)
    }
  }

	@objc
	func logMessageWithSeverityAndProperties(
			_ message: String,
			severity: String,
			properties: NSDictionary,
			resolver resolve: @escaping RCTPromiseResolveBlock,
			rejecter reject: @escaping RCTPromiseRejectBlock
	) {
			do {
					let severityValue = self.severityFromString(severity)

					try Embrace.client?.logMessage(
							message,
							severity: severityValue,
							attributes: properties as? [AnyHashable : Any]
					)
					resolve(true)
			} catch {
					reject(false)
			}
	}

	private func severity(from inputString: String) -> EMBSeverity {
    switch inputString {
    case "info":
        return .info
    case "warning":
        return .warning
    default:
        return .error
    }
}
}
