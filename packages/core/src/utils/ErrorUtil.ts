type ErrorHandler = (error: Error, callback: () => void) => void;

type GlobalErrorHandler = (
    previousHandler: (error: Error, isFatal?: boolean) => void,
    handleError: ErrorHandler
  ) => (error: Error, isFatal?: boolean) => void;

const handleGlobalError: GlobalErrorHandler =
  (previousHandler, handleError) => (error, isFatal) => {
    const callback = () => {
      setTimeout(() => {
        previousHandler(error, isFatal);
      }, 150);
    };
    handleError(error, callback);
  };

export { handleGlobalError };
