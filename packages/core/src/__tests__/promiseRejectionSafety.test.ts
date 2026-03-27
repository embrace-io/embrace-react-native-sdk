/**
 * Tests that all public API methods swallow native promise rejections
 * and never throw when awaited. This is critical for SDK safety — a failing
 * SDK call should never crash customer code.
 */

const NATIVE_ERROR = new Error("Native module error");

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    addBreadcrumb: jest.fn().mockRejectedValue(NATIVE_ERROR),
    addUserPersona: jest.fn().mockRejectedValue(NATIVE_ERROR),
    clearUserPersona: jest.fn().mockRejectedValue(NATIVE_ERROR),
    clearAllUserPersonas: jest.fn().mockRejectedValue(NATIVE_ERROR),
    setUserIdentifier: jest.fn().mockRejectedValue(NATIVE_ERROR),
    clearUserIdentifier: jest.fn().mockRejectedValue(NATIVE_ERROR),
    setUsername: jest.fn().mockRejectedValue(NATIVE_ERROR),
    clearUsername: jest.fn().mockRejectedValue(NATIVE_ERROR),
    setUserEmail: jest.fn().mockRejectedValue(NATIVE_ERROR),
    clearUserEmail: jest.fn().mockRejectedValue(NATIVE_ERROR),
    logMessageWithSeverityAndProperties: jest
      .fn()
      .mockRejectedValue(NATIVE_ERROR),
    logHandledError: jest.fn().mockRejectedValue(NATIVE_ERROR),
    addSessionProperty: jest.fn().mockRejectedValue(NATIVE_ERROR),
    removeSessionProperty: jest.fn().mockRejectedValue(NATIVE_ERROR),
    endSession: jest.fn().mockRejectedValue(NATIVE_ERROR),
    getCurrentSessionId: jest.fn().mockRejectedValue(NATIVE_ERROR),
    getLastRunEndState: jest.fn().mockRejectedValue(NATIVE_ERROR),
    getDeviceId: jest.fn().mockRejectedValue(NATIVE_ERROR),
    logNetworkRequest: jest.fn().mockRejectedValue(NATIVE_ERROR),
    logNetworkClientError: jest.fn().mockRejectedValue(NATIVE_ERROR),
    setJavaScriptPatchNumber: jest.fn().mockRejectedValue(NATIVE_ERROR),
    setJavaScriptBundlePath: jest.fn().mockRejectedValue(NATIVE_ERROR),
  },
}));

jest.mock("../utils/log", () => ({
  ...jest.requireActual("../utils/log"),
  generateStackTrace: () => "mock stack trace",
}));

import {addBreadcrumb} from "../api/breadcrumb";
import {
  addUserPersona,
  clearUserPersona,
  clearAllUserPersonas,
  setUserIdentifier,
  clearUserIdentifier,
  setUsername,
  clearUsername,
  setUserEmail,
  clearUserEmail,
} from "../api/user";
import {
  logMessage,
  logInfo,
  logWarning,
  logError,
  logHandledError,
} from "../api/log";
import {
  addSessionProperty,
  removeSessionProperty,
  endSession,
  getCurrentSessionId,
  getLastRunEndState,
  getDeviceId,
} from "../api/session";
import {recordNetworkRequest, logNetworkClientError} from "../api/network";
import {setJavaScriptPatch, setJavaScriptBundlePath} from "../api/bundle";
import {logIfComponentError, ComponentError} from "../api/component";

describe("Promise rejection safety", () => {
  describe("breadcrumb", () => {
    it("addBreadcrumb does not throw on rejection", async () => {
      const result = await addBreadcrumb("test");
      expect(result).toBe(false);
    });
  });

  describe("user", () => {
    it("addUserPersona does not throw on rejection", async () => {
      const result = await addUserPersona("persona");
      expect(result).toBe(false);
    });

    it("clearUserPersona does not throw on rejection", async () => {
      const result = await clearUserPersona("persona");
      expect(result).toBe(false);
    });

    it("clearAllUserPersonas does not throw on rejection", async () => {
      const result = await clearAllUserPersonas();
      expect(result).toBe(false);
    });

    it("setUserIdentifier does not throw on rejection", async () => {
      const result = await setUserIdentifier("user123");
      expect(result).toBe(false);
    });

    it("clearUserIdentifier does not throw on rejection", async () => {
      const result = await clearUserIdentifier();
      expect(result).toBe(false);
    });

    it("setUsername does not throw on rejection", async () => {
      const result = await setUsername("name");
      expect(result).toBe(false);
    });

    it("clearUsername does not throw on rejection", async () => {
      const result = await clearUsername();
      expect(result).toBe(false);
    });

    it("setUserEmail does not throw on rejection", async () => {
      const result = await setUserEmail("email@test.com");
      expect(result).toBe(false);
    });

    it("clearUserEmail does not throw on rejection", async () => {
      const result = await clearUserEmail();
      expect(result).toBe(false);
    });
  });

  describe("log", () => {
    it("logMessage does not throw on rejection", async () => {
      const result = await logMessage("test");
      expect(result).toBe(false);
    });

    it("logInfo does not throw on rejection", async () => {
      const result = await logInfo("test");
      expect(result).toBe(false);
    });

    it("logWarning does not throw on rejection", async () => {
      const result = await logWarning("test");
      expect(result).toBe(false);
    });

    it("logError does not throw on rejection", async () => {
      const result = await logError("test");
      expect(result).toBe(false);
    });

    it("logHandledError does not throw on rejection", async () => {
      const result = await logHandledError(new Error("test"));
      expect(result).toBe(false);
    });
  });

  describe("session", () => {
    it("addSessionProperty does not throw on rejection", async () => {
      const result = await addSessionProperty("key", "value", false);
      expect(result).toBe(false);
    });

    it("removeSessionProperty does not throw on rejection", async () => {
      const result = await removeSessionProperty("key");
      expect(result).toBe(false);
    });

    it("endSession does not throw on rejection", async () => {
      const result = await endSession();
      expect(result).toBe(false);
    });

    it("getCurrentSessionId does not throw on rejection", async () => {
      const result = await getCurrentSessionId();
      expect(result).toBe("");
    });

    it("getLastRunEndState does not throw on rejection", async () => {
      const result = await getLastRunEndState();
      expect(result).toBe("INVALID");
    });

    it("getDeviceId does not throw on rejection", async () => {
      const result = await getDeviceId();
      expect(result).toBe("");
    });
  });

  describe("network", () => {
    it("recordNetworkRequest does not throw on rejection", async () => {
      const result = await recordNetworkRequest(
        "https://example.com",
        "GET",
        1000,
        2000,
      );
      expect(result).toBe(false);
    });

    it("logNetworkClientError does not throw on rejection", async () => {
      const result = await logNetworkClientError(
        "https://example.com",
        "GET",
        1000,
        2000,
        "Timeout",
        "timed out",
      );
      expect(result).toBe(false);
    });
  });

  describe("bundle", () => {
    it("setJavaScriptPatch does not throw on rejection", async () => {
      const result = await setJavaScriptPatch("v1");
      expect(result).toBe(false);
    });

    it("setJavaScriptBundlePath does not throw on rejection", async () => {
      const result = await setJavaScriptBundlePath("/path/to/bundle");
      expect(result).toBe(false);
    });
  });

  describe("component", () => {
    it("logIfComponentError does not throw on rejection", async () => {
      const error = new Error("render error") as ComponentError;
      error.componentStack = "in App\nin View";
      const result = await logIfComponentError(error);
      expect(result).toBe(false);
    });
  });
});
