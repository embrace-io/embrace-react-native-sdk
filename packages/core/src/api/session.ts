/**
 * Session API
 *
 * Provides methods for managing session properties and retrieving session metadata.
 * Sessions are the core unit of data collection in Embrace and represent a single
 * period of user interaction with the app.
 *
 * @see {@link https://embrace.io/docs/react-native/features/identify-users | Session Properties Documentation}
 * @see {@link https://embrace.io/docs/react-native/features/session-metadata | Session Metadata Documentation}
 */

import {SessionStatus} from "../interfaces";
import {EmbraceManagerModule} from "../EmbraceManagerModule";

/**
 * Adds a key-value property to the current session.
 *
 * Session properties are searchable in the Embrace dashboard and can be used to
 * filter and categorize sessions.
 *
 * @param key - The property name
 * @param value - The property value
 * @param permanent - If `true`, the property persists across sessions until explicitly removed.
 *   If `false`, the property is cleared when the session ends.
 * @returns A promise that resolves to `true` if the property was successfully added, `false` otherwise
 *
 * @example
 * ```typescript
 * import { addSessionProperty } from '@embrace-io/react-native';
 *
 * // Temporary property (cleared at session end)
 * addSessionProperty('launch_type', 'push_notification', false);
 *
 * // Permanent property (persists across sessions)
 * addSessionProperty('subscription_tier', 'premium', true);
 * ```
 */
const addSessionProperty = (
  key: string,
  value: string,
  permanent: boolean,
): Promise<boolean> => {
  return EmbraceManagerModule.addSessionProperty(key, value, permanent);
};

/**
 * Removes a previously set session property.
 *
 * @param key - The property name to remove
 * @returns A promise from the native module call
 *
 * @example
 * ```typescript
 * import { removeSessionProperty } from '@embrace-io/react-native';
 *
 * removeSessionProperty('launch_type');
 * ```
 */
const removeSessionProperty = (key: string) => {
  return EmbraceManagerModule.removeSessionProperty(key);
};

/**
 * Manually ends the current session and starts a new one.
 *
 * Sessions normally end when the app is backgrounded. Use this to force a session
 * boundary at a specific point in the user flow.
 *
 * @returns A promise from the native module call
 *
 * @example
 * ```typescript
 * import { endSession } from '@embrace-io/react-native';
 *
 * // End session after a major user flow completes
 * await endSession();
 * ```
 */
const endSession = () => {
  return EmbraceManagerModule.endSession();
};

/**
 * Retrieves the ID of the currently active session.
 *
 * Must be called after the SDK has been initialized.
 *
 * @returns A promise that resolves to the current session ID string
 *
 * @remarks
 * If called inside an `AppState` change listener, the session may be in the process
 * of ending. Consider adding a delay or calling at another point in the lifecycle
 * to ensure you get the session ID you expect.
 *
 * @example
 * ```typescript
 * import { getCurrentSessionId } from '@embrace-io/react-native';
 *
 * const sessionId = await getCurrentSessionId();
 * console.log('Current session:', sessionId);
 * ```
 */
const getCurrentSessionId = (): Promise<string> => {
  return EmbraceManagerModule.getCurrentSessionId();
};

/**
 * Returns the end state of the previous app instance (cold launch).
 *
 * Use this to detect whether the app previously crashed and adjust behavior
 * or UI accordingly (e.g., show a recovery message).
 *
 * The value persists across background/foreground cycles within the same cold launch.
 * It only changes after a full app restart.
 *
 * @returns A promise that resolves to one of:
 *   - `"INVALID"` - SDK was not started when this was called
 *   - `"CRASH"` - The previous app instance ended in a crash
 *   - `"CLEAN_EXIT"` - The previous app instance exited cleanly
 *
 * @example
 * ```typescript
 * import { getLastRunEndState } from '@embrace-io/react-native';
 *
 * const lastState = await getLastRunEndState();
 * if (lastState === 'CRASH') {
 *   // Show recovery UI or send diagnostic info
 * }
 * ```
 */
const getLastRunEndState = (): Promise<SessionStatus> => {
  return EmbraceManagerModule.getLastRunEndState();
};

/**
 * Retrieves the Embrace device ID.
 *
 * The device ID is a stable identifier assigned by the Embrace SDK that persists
 * across app sessions. It can be used to look up all sessions from a specific device
 * in the Embrace dashboard.
 *
 * @returns A promise that resolves to the device ID string
 *
 * @example
 * ```typescript
 * import { getDeviceId } from '@embrace-io/react-native';
 *
 * const deviceId = await getDeviceId();
 * console.log('Embrace Device ID:', deviceId);
 * ```
 */
const getDeviceId = (): Promise<string> => {
  return EmbraceManagerModule.getDeviceId();
};

export {
  addSessionProperty,
  removeSessionProperty,
  endSession,
  getCurrentSessionId,
  getLastRunEndState,
  getDeviceId,
};
