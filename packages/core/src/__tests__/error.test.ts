import {ComponentError, logIfComponentError} from "../utils/ComponentError";

import {Properties} from "./../index";

const mockLogMessageWithSeverityAndProperties = jest.fn();

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    logMessageWithSeverityAndProperties: (
      message: string,
      errorType: string,
      properties: Properties,
      componentStack: string,
    ) => {
      mockLogMessageWithSeverityAndProperties(
        message,
        errorType,
        properties,
        componentStack,
      );
      return Promise.resolve(true);
    },
  },
}));

describe("Component Error", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("error is not a `ComponentError", () => {
    it("and it should not log an extra unhandled exception", async () => {
      const customError = new Error("Ups!");

      const result = await logIfComponentError(customError);
      expect(result).toBe(false);
      expect(mockLogMessageWithSeverityAndProperties).not.toHaveBeenCalled();
    });
  });

  describe("error is a `ComponentError`", () => {
    it("but the stack is empty", async () => {
      const customError = new Error("Ups!") as ComponentError;
      customError.componentStack = "";

      const result = await logIfComponentError(customError);
      expect(result).toBe(false);
      expect(mockLogMessageWithSeverityAndProperties).not.toHaveBeenCalled();
    });

    test("but the stack is not empty", async () => {
      const componentError = new Error("Ups!") as ComponentError;
      componentError.componentStack = "in SomeScreen/n in SomeOtherScreen";

      const result = await logIfComponentError(componentError);
      expect(result).toBe(true);
      expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        "Ups!",
        "error",
        {},
        "in SomeScreen/n in SomeOtherScreen",
      );
    });
  });
});
