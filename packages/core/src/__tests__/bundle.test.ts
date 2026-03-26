import {setJavaScriptBundlePath} from "../api/bundle";

const mockSetJavaScriptBundlePath = jest.fn();

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    setJavaScriptBundlePath: (path: string) => {
      mockSetJavaScriptBundlePath(path);
      return Promise.resolve(true);
    },
  },
}));

describe("JavaScript bundle", () => {
  test("setJavaScriptBundlePath", async () => {
    await setJavaScriptBundlePath("path");
    expect(mockSetJavaScriptBundlePath).toHaveBeenCalledWith("path");
  });
});
