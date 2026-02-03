/**
 * Bundle API
 *
 * Provides methods for configuring JavaScript bundle information used by the Embrace SDK
 * for crash symbolication and version tracking. These are primarily used for over-the-air
 * (OTA) update scenarios where the JS bundle may differ from what was originally shipped.
 *
 * @see {@link https://embrace.io/docs/react-native/integration/upload-symbol-files | Upload Symbol Files Documentation}
 */

import {EmbraceManagerModule} from "../EmbraceManagerModule";

/**
 * Sets a patch identifier for the current JavaScript bundle.
 *
 * Use this to distinguish between different OTA updates of the same app version.
 * This helps identify which specific JS bundle version a user is running when
 * investigating issues in the Embrace dashboard.
 *
 * @param patch - A string identifier for the JS patch version (e.g., "1.2.3-hotfix1")
 * @returns A promise from the native module call
 *
 * @example
 * ```typescript
 * import { setJavaScriptPatch } from '@embrace-io/react-native';
 *
 * // After an OTA update is applied
 * setJavaScriptPatch('2025.01.15-fix');
 * ```
 */
const setJavaScriptPatch = (patch: string) => {
  return EmbraceManagerModule.setJavaScriptPatchNumber(patch);
};

/**
 * Sets the file path to the JavaScript bundle.
 *
 * This is used by the SDK to locate the correct source map for crash symbolication.
 * On iOS in production builds, this is set automatically during initialization.
 * You typically only need to call this manually if you are using a custom bundle
 * loading mechanism.
 *
 * @param path - The file path to the JavaScript bundle
 * @returns A promise from the native module call
 *
 * @example
 * ```typescript
 * import { setJavaScriptBundlePath } from '@embrace-io/react-native';
 *
 * // Point to a custom bundle location
 * setJavaScriptBundlePath('/path/to/custom/bundle.js');
 * ```
 */
const setJavaScriptBundlePath = (path: string) => {
  return EmbraceManagerModule.setJavaScriptBundlePath(path);
};

export {setJavaScriptBundlePath, setJavaScriptPatch};
