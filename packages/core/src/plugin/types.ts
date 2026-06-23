import {OTLPExporterConfig} from "../interfaces";

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
   * iOSExporters configures custom OTLP exporters that are wired into the *native* Embrace start on iOS
   * (in the generated `EmbraceInitializer.swift`). This is required because the Expo plugin starts Embrace
   * natively at launch (for early crash capture), which pre-empts the JS `useEmbrace({exporters})` path — so
   * on Expo iOS, JS-supplied exporters are never attached (see issue #653). Providing them here injects them
   * at the native start instead, keeping both crash capture and OTLP forwarding. The OTLP endpoint hosts are
   * also excluded from URLSession capture so the exporter's own upload requests aren't instrumented (the
   * native equivalent of `iOSConfig.disabledUrlPatterns`). Values are baked in at prebuild.
   */
  iOSExporters?: OTLPExporterConfig;
};

export {EmbraceProps};
