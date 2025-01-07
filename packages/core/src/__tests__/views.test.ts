import {endView, startView} from "../api/views";

const mockStartView = jest.fn();
const mockEndView = jest.fn();

const MOCK_VIEW = "View";

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    startView: (view: string) => mockStartView(view),
    endView: (view: string) => mockEndView(view),
  },
}));

describe("Custom Views Tests", () => {
  test("startView", async () => {
    const promiseToResolve = startView(MOCK_VIEW);

    await promiseToResolve;
    expect(mockStartView).toHaveBeenCalledWith(MOCK_VIEW);
  });

  test("endView", async () => {
    jest.useFakeTimers();

    const promiseToResolve = endView(MOCK_VIEW);
    jest.runAllTimers();
    await promiseToResolve;
    expect(mockEndView).toHaveBeenCalledWith(MOCK_VIEW);
  });
});
