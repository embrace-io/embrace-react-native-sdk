/**
 * Breadcrumb API
 *
 * Breadcrumbs are lightweight events that provide context within a session. They are useful for
 * tracking user actions and application state changes without the overhead of full log messages.
 *
 * @see {@link https://embrace.io/docs/react-native/integration/breadcrumbs | Breadcrumbs Documentation}
 */

import {EmbraceManagerModule} from "../EmbraceManagerModule";

/**
 * Adds a breadcrumb event to the current session.
 *
 * Breadcrumbs are a lightweight way to add context to sessions. They are displayed in the
 * session timeline in the Embrace dashboard and can help trace the sequence of events
 * leading up to a crash or issue.
 *
 * Unlike log messages, breadcrumbs do not trigger an immediate network request and have
 * minimal CPU/memory overhead.
 *
 * @param message - A short descriptive string for the breadcrumb event
 * @returns A promise that resolves to `true` if the breadcrumb was successfully added, `false` otherwise
 *
 * @example
 * ```typescript
 * import { addBreadcrumb } from '@embrace-io/react-native';
 *
 * // Track a user action
 * addBreadcrumb('User tapped checkout button');
 *
 * // Track a state change
 * addBreadcrumb('Cart loaded with 3 items');
 * ```
 */
const addBreadcrumb = (message: string): Promise<boolean> => {
  return EmbraceManagerModule.addBreadcrumb(message);
};

export {addBreadcrumb};
