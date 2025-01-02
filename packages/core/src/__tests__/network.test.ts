import {logNetworkClientError, recordNetworkRequest} from "../utils/network";
import {MethodType} from "../interfaces";

const mockLogNetworkClientError = jest.fn();
const mockLogNetworkRequest = jest.fn();

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    logNetworkRequest: (
      url: string,
      httpMethod: MethodType,
      startInMillis: number,
      endInMillis: number,
      bytesSent: number,
      bytesReceived: number,
      statusCode: number,
    ) =>
      mockLogNetworkRequest(
        url,
        httpMethod,
        startInMillis,
        endInMillis,
        bytesSent,
        bytesReceived,
        statusCode,
      ),
    logNetworkClientError: (
      url: string,
      httpMethod: MethodType,
      startInMillis: number,
      endInMillis: number,
      errorType: string,
      errorMessage: string,
    ) =>
      mockLogNetworkClientError(
        url,
        httpMethod,
        startInMillis,
        endInMillis,
        errorType,
        errorMessage,
      ),
  },
}));

describe("Record network call", () => {
  const url = "https://httpbin.org/v1/random/api";
  const method = "get";
  const nowdate = new Date();
  const st = nowdate.getTime();
  const et = nowdate.setUTCSeconds(30);
  const bytesIn = 111;
  const bytesOut = 222;
  const networkStatus = 200;

  it("record a Completed network request", async () => {
    await recordNetworkRequest(
      url,
      method,
      st,
      et,
      bytesIn,
      bytesOut,
      networkStatus,
    );

    expect(mockLogNetworkRequest).toHaveBeenCalledWith(
      url,
      method,
      st,
      et,
      bytesIn,
      bytesOut,
      networkStatus,
    );
  });

  it("record an Incomplete network request", async () => {
    await recordNetworkRequest(url, method, st, et);

    expect(mockLogNetworkRequest).toHaveBeenCalledWith(
      url,
      method,
      st,
      et,
      -1,
      -1,
      -1,
    );
  });

  it("record a network client error", async () => {
    await logNetworkClientError(
      url,
      method,
      st,
      et,
      "error-type",
      "error-message",
    );

    expect(mockLogNetworkClientError).toHaveBeenCalledWith(
      url,
      method,
      st,
      et,
      "error-type",
      "error-message",
    );
  });
});
