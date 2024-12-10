import {ComponentError, logIfComponentError} from "../utils/ComponentError";

const mockLogHandledError = jest.fn().mockReturnValue(Promise.resolve(true));

jest.mock("react-native", () => ({
  NativeModules: {
    EmbraceManager: {
      logHandledError: (
        message: string,
        componentStack: string,
        params: object,
      ) => mockLogHandledError(message, componentStack, params),
    },
  },
}));

describe("Component Error", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Error is not a component error", async () => {
    const customError = new Error("Ups!");

    const result = await logIfComponentError(customError);
    expect(result).toBe(false);
    expect(mockLogHandledError).not.toHaveBeenCalled();
  });

  test("Error is a component error, but the component stack is empty", async () => {
    const customError = new Error("Ups!") as ComponentError;

    customError.componentStack = "";

    const result = await logIfComponentError(customError);
    expect(result).toBe(false);
    expect(mockLogHandledError).not.toHaveBeenCalled();
  });

  test("Error is a component error and the component stack is not empty", async () => {
    const componentError = new Error("Ups!") as ComponentError;

    componentError.componentStack = "in SomeScreen/n in SomeOtherScreen";

    const result = await logIfComponentError(componentError);
    expect(result).toBe(true);
    expect(mockLogHandledError).toHaveBeenCalledWith(
      componentError.message,
      componentError.componentStack,
      {},
    );
  });

  test("Error is a component error and the component stack is not empty", async () => {
    const componentError = new Error("Ups!") as ComponentError;

    componentError.componentStack =
      "at undefined (in App)\nat undefined (in SomeView)";
    const textShrinked = "in App\nin SomeView";

    const result = await logIfComponentError(componentError);
    expect(result).toBe(true);
    expect(mockLogHandledError).toHaveBeenCalledWith(
      componentError.message,
      textShrinked,
      {},
    );
  });
});
