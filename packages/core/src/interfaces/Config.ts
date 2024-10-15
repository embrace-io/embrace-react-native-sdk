/**
 * Defines the SDK configuration that can be passed into `initialize`
 */
export interface SDKConfig {
  ios?: {
    appId: string;
    appGroupId?: string;
    disableCrashReporter?: boolean;
    disableAutomaticViewCapture?: boolean;
    endpointBaseUrl?: string;
  };
}
