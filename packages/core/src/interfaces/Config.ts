/**
 * Defines the SDK configuration that can be passed into `initialize`
 */

interface IOSConfig {
  appId: string;
  appGroupId?: string;
  disableCrashReporter?: boolean;
  disableAutomaticViewCapture?: boolean;
  endpointBaseUrl?: string;
}

interface SDKConfig {
  ios?: IOSConfig;
  replaceInit?: (config: IOSConfig | NonNullable<object>) => Promise<boolean>;
}

export {SDKConfig};
