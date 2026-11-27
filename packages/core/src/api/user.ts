/**
 * User API
 *
 * This module provides methods to identify users and annotate sessions with user metadata.
 * User information is attached to sessions and can be used to search for and filter sessions
 * in the Embrace dashboard.
 *
 * @remarks
 * Consider privacy implications when setting user data. We recommend using anonymized
 * or hashed identifiers rather than personally identifiable information (PII).
 *
 * @see {@link https://embrace.io/docs/react-native/features/identify-users | Identify Users Documentation}
 */

import {safePromise} from "../utils/promiseHandler";
import {EmbraceManagerModule} from "../EmbraceManagerModule";

/**
 * Adds a custom persona tag to the current user.
 *
 * Personas allow you to categorize users into groups for filtering and analysis.
 * Multiple personas can be added to a single user.
 *
 * @param persona - A string tag to categorize the user (e.g., "premium_user", "beta_tester")
 * @returns A promise that resolves to `true` if the persona was successfully added, `false` otherwise
 *
 * @example
 * ```typescript
 * import { addUserPersona } from '@embrace-io/react-native';
 *
 * // Tag user as a high-value customer
 * await addUserPersona('high_value_cart');
 * ```
 */
const addUserPersona = (persona: string): Promise<boolean> =>
  safePromise(
    EmbraceManagerModule.addUserPersona(persona),
    "addUserPersona",
    false,
  );

/**
 * Removes a specific persona tag from the current user.
 *
 * @param persona - The persona tag to remove
 * @returns A promise that resolves to `true` if the persona was successfully removed, `false` otherwise
 *
 * @example
 * ```typescript
 * import { clearUserPersona } from '@embrace-io/react-native';
 *
 * await clearUserPersona('high_value_cart');
 * ```
 */
const clearUserPersona = (persona: string): Promise<boolean> =>
  safePromise(
    EmbraceManagerModule.clearUserPersona(persona),
    "clearUserPersona",
    false,
  );

/**
 * Removes all persona tags from the current user.
 *
 * @returns A promise that resolves to `true` if all personas were successfully cleared, `false` otherwise
 *
 * @example
 * ```typescript
 * import { clearAllUserPersonas } from '@embrace-io/react-native';
 *
 * await clearAllUserPersonas();
 * ```
 */
const clearAllUserPersonas = (): Promise<boolean> =>
  safePromise(
    EmbraceManagerModule.clearAllUserPersonas(),
    "clearAllUserPersonas",
    false,
  );

/**
 * Sets a unique identifier for the current user.
 *
 * This identifier is used to link sessions to a specific user and can be searched
 * for in the Embrace dashboard. All future sessions will be associated
 * with this identifier once set.
 *
 * @param userIdentifier - A unique identifier for the user (e.g., internal user ID, hashed email)
 * @returns A promise that resolves to `true` if the identifier was successfully set, `false` otherwise
 *
 * @example
 * ```typescript
 * import { setUserIdentifier } from '@embrace-io/react-native';
 *
 * await setUserIdentifier('user_12345');
 * ```
 */
const setUserIdentifier = (userIdentifier: string): Promise<boolean> =>
  safePromise(
    EmbraceManagerModule.setUserIdentifier(userIdentifier),
    "setUserIdentifier",
    false,
  );

/**
 * Clears the current user identifier.
 *
 * Call this when a user logs out to stop associating sessions with the previous user.
 *
 * @returns A promise that resolves to `true` if the identifier was successfully cleared, `false` otherwise
 *
 * @example
 * ```typescript
 * import { clearUserIdentifier } from '@embrace-io/react-native';
 *
 * // Call on logout
 * await clearUserIdentifier();
 * ```
 */
const clearUserIdentifier = (): Promise<boolean> =>
  safePromise(
    EmbraceManagerModule.clearUserIdentifier(),
    "clearUserIdentifier",
    false,
  );

export {
  addUserPersona,
  clearUserPersona,
  clearAllUserPersonas,
  setUserIdentifier,
  clearUserIdentifier,
};
