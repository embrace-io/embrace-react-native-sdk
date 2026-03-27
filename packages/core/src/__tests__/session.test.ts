import {
  addSessionProperty,
  getCurrentSessionId,
  getDeviceId,
  getLastRunEndState,
  removeSessionProperty,
} from "../api/session";

const mockAddSessionProperty = jest.fn().mockReturnValue(Promise.resolve(true));
const mockRemoveSessionProperty = jest
  .fn()
  .mockReturnValue(Promise.resolve(true));
const mockGetLastRunEndState = jest
  .fn()
  .mockReturnValue(Promise.resolve("CLEAN_EXIT"));
const mockGetDeviceId = jest.fn().mockReturnValue(Promise.resolve("device-id"));
const mockGetCurrentSessionId = jest
  .fn()
  .mockReturnValue(Promise.resolve("session-id"));

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    addSessionProperty: (key: string, value: string, permanent: boolean) =>
      mockAddSessionProperty(key, value, permanent),
    removeSessionProperty: (key: string) => mockRemoveSessionProperty(key),
    getLastRunEndState: () => mockGetLastRunEndState(),
    getDeviceId: () => mockGetDeviceId(),
    getCurrentSessionId: () => mockGetCurrentSessionId(),
  },
}));

describe("Session Properties Tests", () => {
  test("should call addSessionProperty with values", async () => {
    await addSessionProperty("foo", "bar", true);
    expect(mockAddSessionProperty).toHaveBeenCalledWith("foo", "bar", true);
  });

  test("removeSessionProperty", async () => {
    await removeSessionProperty("foo");
    expect(mockRemoveSessionProperty).toHaveBeenCalledWith("foo");
  });
});

describe("Test Device Stuffs", () => {
  test("device Id", async () => {
    await getDeviceId();
    expect(mockGetDeviceId).toHaveBeenCalled();
  });

  test("session Id", async () => {
    await getCurrentSessionId();
    expect(mockGetCurrentSessionId).toHaveBeenCalled();
  });
});

describe("Last Session Info", () => {
  test("last run status", async () => {
    await getLastRunEndState();
    expect(mockGetLastRunEndState).toHaveBeenCalled();
  });
});
