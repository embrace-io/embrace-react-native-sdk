import {enableOrientationTracking} from "../utils/orientation";

const LANDSCAPE = {width: 200, height: 100};
const PORTRAIT = {width: 100, height: 200};

const mockAddBreadcrumb = jest.fn();
const mockDimensionsGet = jest.fn();
const mockDimensionsAddEventListener = jest.fn();

jest.mock("../api/breadcrumb", () => ({
  addBreadcrumb: (message: string) => mockAddBreadcrumb(message),
}));

jest.mock("react-native", () => ({
  Dimensions: {
    get: (dim: string) => mockDimensionsGet(dim),
    addEventListener: (type: string, handler: unknown) =>
      mockDimensionsAddEventListener(type, handler),
  },
}));

const changeTo = (screen: {width: number; height: number}) =>
  mockDimensionsAddEventListener.mock.calls[0][1]({screen});

describe("enableOrientationTracking", () => {
  test("records the starting orientation", () => {
    mockDimensionsGet.mockReturnValue(LANDSCAPE);

    enableOrientationTracking();

    expect(mockDimensionsGet).toHaveBeenCalledWith("screen");
    expect(mockDimensionsAddEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
    expect(mockAddBreadcrumb.mock.calls).toEqual([
      ["The App started in landscape mode"],
    ]);
  });

  test("records each change of orientation", () => {
    mockDimensionsGet.mockReturnValue(PORTRAIT);
    enableOrientationTracking();

    changeTo(LANDSCAPE);
    changeTo(PORTRAIT);

    expect(mockAddBreadcrumb.mock.calls).toEqual([
      ["The App started in portrait mode"],
      ["Screen Orientation changed from: portrait -> landscape"],
      ["Screen Orientation changed from: landscape -> portrait"],
    ]);
  });

  test("ignores a change to the same orientation", () => {
    mockDimensionsGet.mockReturnValue(PORTRAIT);
    enableOrientationTracking();

    changeTo({width: 120, height: 240});

    expect(mockAddBreadcrumb).toHaveBeenCalledTimes(1);
  });
});
