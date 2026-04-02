export interface SDKErrorLoggingConfig {
  /**
   * Enable/disable internal SDK error logging.
   */
  enabled: boolean;

  /**
   * Log SDK errors to the console.
   * Recommend to set to true in development environments for easier debugging.
   * Recommend to set to false in production environments to avoid duplicate logging.
   */
  allowLogToConsole: boolean;

  /**
   * Optional custom handler for SDK errors.
   * Use this to integrate with your own error tracking system.
   * @example
   * ```ts
   * customHandler: (method, error) => {
   *   MyErrorTrackingService.logError(`SDK error in ${method}`, error);
   * }
   * ```
   */
  customHandler?: (methodName: string, error: Error) => void;
}

let errorLoggingConfig: SDKErrorLoggingConfig = {
  enabled: false,
  allowLogToConsole: false,
};

export const handleSDKError = (methodName: string, error: unknown): void => {
  if (!errorLoggingConfig.enabled) {
    return;
  }

  const errorObj = error instanceof Error ? error : new Error(String(error));
  const errorMessage = errorObj.message || String(error);

  if (errorLoggingConfig.customHandler) {
    try {
      errorLoggingConfig.customHandler(methodName, errorObj);
    } catch (handlerError) {
      if (errorLoggingConfig.allowLogToConsole) {
        console.error(
          `[Embrace RN SDK] Error in custom error handler for ${methodName}:`,
          handlerError,
        );
      }
    }
  }

  if (errorLoggingConfig.allowLogToConsole) {
    console.error(
      `[Embrace RN SDK] SDK error in ${methodName}: ${errorMessage}`,
      errorObj,
    );

    if (errorObj.stack) {
      console.error(`Stack trace:\n${errorObj.stack}`);
    }
  }
};

export const safePromise = <T>(
  promise: Promise<T>,
  methodName: string,
  fallback: T,
): Promise<T> =>
  promise.catch((error: unknown) => {
    handleSDKError(methodName, error);
    return fallback;
  });

export const configureSDKErrorLogging = (
  config: Partial<SDKErrorLoggingConfig>,
): void => {
  errorLoggingConfig = {
    ...errorLoggingConfig,
    ...config,
  };
};

export const getSDKErrorLoggingConfig = (): Readonly<SDKErrorLoggingConfig> => {
  return {...errorLoggingConfig};
};
