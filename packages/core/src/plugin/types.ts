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
};

export {EmbraceProps};
