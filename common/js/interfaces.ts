/**
 * Common interfaces shared by Embrace Packages
 */

// Today Android is not configurable through code,
// this is a placeholder for future implementations.
interface AndroidConfig {}

interface IOSConfig {
  appId: string;
  appGroupId?: string;
  disableCrashReporter?: boolean;
  disableAutomaticViewCapture?: boolean;
  disableNetworkSpanForwarding?: boolean;
  endpointBaseUrl?: string;
  disabledUrlPatterns?: string[];
}

interface SDKConfig {
  ios?: IOSConfig;
  startCustomExport?: (
    config: IOSConfig | NonNullable<object>,
  ) => Promise<boolean>;
}

interface LogProperties {
  [key: string]: string;
}

export {SDKConfig, IOSConfig, AndroidConfig, LogProperties};