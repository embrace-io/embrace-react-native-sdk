/**
 * Common interfaces shared by packages
 */

interface IOSConfig {
  appId: string;
  appGroupId?: string;
  disableCrashReporter?: boolean;
  disableAutomaticViewCapture?: boolean;
  endpointBaseUrl?: string;
}

// NOTE: as per today Android is not configurable through code, this is a placeholder for future implementations.
// Not even sure if it will ever happen
interface AndroidConfig {}

interface IOSConfig {
  appId: string;
  appGroupId?: string;
  disableCrashReporter?: boolean;
  disableAutomaticViewCapture?: boolean;
  endpointBaseUrl?: string;
}

interface SDKConfig {
  ios?: IOSConfig;
  startCustomExport?: (
    config: IOSConfig | NonNullable<object>,
  ) => Promise<boolean>;
}

export {SDKConfig, IOSConfig, AndroidConfig};
