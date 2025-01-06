import {renderHook} from "@testing-library/react-native";

import {useOrientationListener} from "../utils/screenOrientation";

jest.useFakeTimers();

const DIMENSIONS = {
  landscape: {width: 200, height: 100},
  portrait: {width: 100, height: 200},
};

const mockBreadcrumb = jest.fn();

jest.mock("react-native", () => ({
  Platform: {select: jest.fn()},
  NativeModules: {
    EmbraceManager: {
      addBreadcrumb: (m: string) => mockBreadcrumb(m),
    },
  },
  Dimensions: {
    addEventListener: jest.fn(),
    get: jest.fn(),
  },
}));

const mockGetDimentions = jest.fn().mockReturnValue(DIMENSIONS.landscape);
const mockAddEventListener = jest.fn().mockImplementation((_, cb) => {
  cb({screen: DIMENSIONS.landscape});
});

jest
  .spyOn(require("react-native").Dimensions, "get")
  .mockImplementation(mockGetDimentions);
jest
  .spyOn(require("react-native").Dimensions, "addEventListener")
  .mockImplementation(mockAddEventListener);

describe("screenOrientation.ts -> useOrientationListener", () => {
  it("initializing as Landscape", () => {
    renderHook(useOrientationListener);

    expect(mockGetDimentions).toHaveBeenCalledTimes(1);
    expect(mockBreadcrumb).toHaveBeenCalledTimes(1);
    expect(mockBreadcrumb).toHaveBeenLastCalledWith(
      "The App started in landscape mode",
    );
  });

  it("on change from Landscape to Portrait", () => {
    renderHook(useOrientationListener);
    expect(mockBreadcrumb).toHaveBeenCalledWith(
      "The App started in landscape mode",
    );

    jest.mocked(mockGetDimentions).mockReturnValue(DIMENSIONS.portrait);
    jest
      .mocked(mockAddEventListener)
      .mock.calls[0][1]({screen: DIMENSIONS.portrait});

    expect(mockBreadcrumb).toHaveBeenCalledWith(
      "Screen Orientation changed from: landscape -> portrait",
    );
  });

  it("initializing as Portrait", () => {
    jest.mocked(mockGetDimentions).mockReturnValue(DIMENSIONS.portrait);
    jest.mocked(mockAddEventListener).mockImplementation((_, cb) => {
      cb({screen: DIMENSIONS.portrait});
    });

    renderHook(useOrientationListener);

    expect(mockGetDimentions).toHaveBeenCalledTimes(1);
    expect(mockBreadcrumb).toHaveBeenCalledTimes(1);
    expect(mockBreadcrumb).toHaveBeenLastCalledWith(
      "The App started in portrait mode",
    );
  });

  it("on change from Portrait to Landscape", () => {
    jest.mocked(mockGetDimentions).mockReturnValue(DIMENSIONS.portrait);
    jest.mocked(mockAddEventListener).mockImplementation((_, cb) => {
      cb({screen: DIMENSIONS.portrait});
    });

    renderHook(useOrientationListener);
    expect(mockBreadcrumb).toHaveBeenCalledWith(
      "The App started in portrait mode",
    );

    jest.mocked(mockGetDimentions).mockReturnValue(DIMENSIONS.landscape);
    jest
      .mocked(mockAddEventListener)
      .mock.calls[0][1]({screen: DIMENSIONS.landscape});

    expect(mockBreadcrumb).toHaveBeenCalledWith(
      "Screen Orientation changed from: portrait -> landscape",
    );
  });

  it("on change with the same dimensions", () => {
    const mockConsoleWarn = jest.fn();
    jest.spyOn(console, "warn").mockImplementation(mockConsoleWarn);
    jest.mocked(mockGetDimentions).mockReturnValue(DIMENSIONS.portrait);
    jest.mocked(mockAddEventListener).mockImplementation((_, cb) => {
      cb({screen: DIMENSIONS.portrait});
    });

    renderHook(useOrientationListener);
    expect(mockBreadcrumb).toHaveBeenCalledWith(
      "The App started in portrait mode",
    );

    jest.mocked(mockGetDimentions).mockReturnValue(DIMENSIONS.portrait);
    jest
      .mocked(mockAddEventListener)
      .mock.calls[0][1]({screen: DIMENSIONS.portrait});

    // no extra calls, just the previous one
    expect(mockBreadcrumb).toHaveBeenCalledTimes(1);
  });

  it("width/height are the same", () => {
    const mockConsoleWarn = jest.fn();
    jest.spyOn(console, "warn").mockImplementation(mockConsoleWarn);
    // getDimensions() should return `undefined`
    jest.mocked(mockGetDimentions).mockReturnValue({width: 10, height: 10});
    jest.mocked(mockAddEventListener).mockImplementation((_, cb) => {
      cb({screen: {width: 10, height: 10}});
    });

    renderHook(useOrientationListener);

    expect(mockBreadcrumb).not.toHaveBeenCalled();
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      "[Embrace] We could not determine the screen measurements. Orientation log skipped.",
    );
  });
});
