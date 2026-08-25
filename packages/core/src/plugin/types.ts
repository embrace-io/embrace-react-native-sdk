type EmbraceProps = {
  /**
   * androidAppId is your Embrace App ID for Android.
   */
  androidAppId: string;

  /**
   * iOSAppId is your Embrace App ID for iOS.
   */
  iOSAppId: string;

  /**
   * apiToken is your Embrace account's Symbol Upload Token used for uploading symbol files to Embrace.
   */
  apiToken: string;

  /**
   * androidSDKConfig specifies additional properties to include within the `sdk_config` section of the Embrace Android
   * configuration that will be generated in `android/app/src/main/embrace-config.json`.
   */
  androidSDKConfig?: object;

  /**
   * productModuleName should be set if your iOS project specifies a PRODUCT_MODULE_NAME that differs from the name
   * found in the app's package.json, see https://developer.apple.com/documentation/swift/importing-swift-into-objective-c#Overview
   * for more details on why this is required.
   */
  productModuleName?: string;

  /**
   * iOSUseSPM sources the Embrace iOS SDK from Swift Package Manager instead of CocoaPods.
   *
   * Requires React Native 0.75 or later, and requires your app to be built with dynamic frameworks.
   * Add the expo-build-properties plugin with `ios.useFrameworks: "dynamic"` alongside this one.
   */
  iOSUseSPM?: boolean;
};

export {EmbraceProps};
