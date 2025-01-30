import {renderHook, waitFor} from "@testing-library/react-native";

import {useEmbraceIsStarted} from "./useEmbraceIsStarted";

const mockIsStarted = jest.fn();

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    isStarted: () => mockIsStarted(),
  },
}));

describe("useEmbraceIsStarted", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return if the Native SDK is started", async () => {
    mockIsStarted.mockResolvedValue(true);
    const {result} = renderHook(() => useEmbraceIsStarted());

    expect(result.current.isChecking).toBe(true);
    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
      expect(result.current.isStarted).toBe(true);
    });
  });

  it("should return if the Native SDK is not started", async () => {
    mockIsStarted.mockResolvedValue(false);
    const {result} = renderHook(() => useEmbraceIsStarted());

    expect(result.current.isChecking).toBe(true);
    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
      expect(result.current.isStarted).toBe(false);
    });
  });

  it("should handle getting an error when checking if the Native SDK is started", async () => {
    mockIsStarted.mockRejectedValue("some error");
    const {result} = renderHook(useEmbraceIsStarted);

    expect(result.current.isChecking).toBe(true);
    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
      expect(result.current.isStarted).toBe(false);
    });
  });
});
