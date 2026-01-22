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
const addUserPersona = (persona: string): Promise<boolean> => {
  return EmbraceManagerModule.addUserPersona(persona);
};

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
const clearUserPersona = (persona: string): Promise<boolean> => {
  return EmbraceManagerModule.clearUserPersona(persona);
};

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
const clearAllUserPersonas = (): Promise<boolean> => {
  return EmbraceManagerModule.clearAllUserPersonas();
};

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
const setUserIdentifier = (userIdentifier: string): Promise<boolean> => {
  return EmbraceManagerModule.setUserIdentifier(userIdentifier);
};

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
const clearUserIdentifier = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUserIdentifier();
};

/**
 * Sets a username for the current user.
 *
 * The username is displayed in the Embrace dashboard and can help identify users
 * when debugging issues.
 * 
 * Note: Be mindful of PII and privacy regulations when setting usernames.
 * We strongly recommend using anonymized or pseudonymous usernames where possible in combination with
 * setUserIdentifier for unique user identification.
 *
 * @param username - The username to associate with the current user
 * @returns A promise that resolves to `true` if the username was successfully set, `false` otherwise
 *
 * @example
 * ```typescript
 * import { setUsername } from '@embrace-io/react-native';
 *
 * await setUsername('jane_doe');
 * ```
 */
const setUsername = (username: string): Promise<boolean> => {
  return EmbraceManagerModule.setUsername(username);
};

/**
 * Clears the current user's username.
 *
 * @returns A promise that resolves to `true` if the username was successfully cleared, `false` otherwise
 *
 * @example
 * ```typescript
 * import { clearUsername } from '@embrace-io/react-native';
 *
 * await clearUsername();
 * ```
 */
const clearUsername = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUsername();
};

/**
 * Sets an email address for the current user.
 *
 * The email is displayed in the Embrace dashboard and can help identify users
 * when debugging issues or providing customer support.
 *
 * Note: Be mindful of PII and privacy regulations when setting user email addresses.
 * We strongly recommend using hashed or anonymized emails where possible in combination with 
 * setUserIdentifier for unique user identification.
 *
 * @param userEmail - The email address to associate with the current user
 * @returns A promise that resolves to `true` if the email was successfully set, `false` otherwise
 *
 * @example
 * ```typescript
 * import { setUserEmail } from '@embrace-io/react-native';
 *
 * await setUserEmail('jane@example.com');
 * ```
 */
const setUserEmail = (userEmail: string): Promise<boolean> => {
  return EmbraceManagerModule.setUserEmail(userEmail);
};

/**
 * Clears the current user's email address.
 *
 * @returns A promise that resolves to `true` if the email was successfully cleared, `false` otherwise
 *
 * @example
 * ```typescript
 * import { clearUserEmail } from '@embrace-io/react-native';
 *
 * await clearUserEmail();
 * ```
 */
const clearUserEmail = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUserEmail();
};

export {
  addUserPersona,
  clearUserPersona,
  clearAllUserPersonas,
  setUserIdentifier,
  clearUserIdentifier,
  setUsername,
  clearUsername,
  setUserEmail,
  clearUserEmail,
};
