export interface EmbracePromiseRejectionConfig {
    /**
     * Enable/disable internal unhandled promise rejection handling.
     */
    enabled: boolean;

    /**
     * Log unhandled promise rejections to the console.
     * Recommend to set to true in development environments for easier debugging.
     * Recommend to set to false in production environments to avoid duplicate logging.
     */
    logToConsole: boolean;

    /** 
     * Optional custom handler for unhandled promise rejections.
     * Use this to integrate with your own error tracking system.
     * @example
     * ```ts
     * customHandler: (method, error) => {
     *   MyErrorTrackingService.logError(`Unhandled promise rejection in ${method}`, error);
     * }
     * ```
     */
    customHandler?: (methodName: string, error: Error) => void;
};

let rejectionConfig: EmbracePromiseRejectionConfig = {
    enabled: true,
    logToConsole: typeof __DEV__ !== 'undefined' ? __DEV__ : false,
};

export function handleSDKPromiseRejection<T>(
    promise: Promise<T>,
    methodName: string,
): void;

export function handleSDKPromiseRejection(
    methodName: string,
    error: unknown,
): void;

export function handleSDKPromiseRejection<T>(
    methodNameOrPromise: string | Promise<T>,
    errorOrMethodName: unknown | string,
): void {

    if (methodNameOrPromise instanceof Promise) {
        const promise = methodNameOrPromise;
        const methodName = errorOrMethodName as string;

        promise.catch((error: unknown) => {
            handleSDKPromiseRejection(methodName, error);
        });
        return;
    }

    const methodName = methodNameOrPromise;
    const error = errorOrMethodName as unknown;

    if (!rejectionConfig.enabled) {
        return;
    }

    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || String(error);

    if (rejectionConfig.customHandler) {
        try {
            rejectionConfig.customHandler(methodName, errorObj);
        } catch (handlerError) {
            if (rejectionConfig.logToConsole) {
                console.error(
                    `[Embrace RN SDK] Error in custom unhandled promise rejection handler for ${methodName}:`,
                    handlerError,
                );
            }
        }
    }

    if (rejectionConfig.logToConsole) {
        console.error(
            `[Embrace RN SDK] Unhandled promise rejection in ${methodName}: ${errorMessage}`,
            errorObj,
        );

        if (errorObj.stack) {
            console.error(`Stack trace:\n${errorObj.stack}`);
        }
    }
};

export const configurePromiseRejection = (
    config: Partial<EmbracePromiseRejectionConfig>,
): void => {
    rejectionConfig = {
        ...rejectionConfig,
        ...config,
    };
};

export const getPromiseRejectionConfig = (): Readonly<EmbracePromiseRejectionConfig> => {
    return { ...rejectionConfig }
}