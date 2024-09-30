import {driver} from "@wdio/globals";

/**
 * Iterates over an array of strings and clicks buttons corresponding to each string.
 * The buttons are selected based on the provided index, and the iteration can be done
 * forwards or backwards depending on the `isBackwards` parameter.
 *
 * @param {string[]} array - An array of strings representing the button selectors or identifiers,
 * you can add variable ${index} in the string that will be replaced by the index at runtime.
 * @param {boolean} [isBackwards=false] - A flag indicating whether to iterate backwards. Defaults to false.
 * @param {number} [intervalTimeInMS=1000] - The time in milliseconds to wait between clicks. Defaults to 1000ms.
 * @param {number} [startIndex=0] - The index to start iterating from. Defaults to 0.
 *
 * @returns {Promise<void>} A promise that resolves when all buttons have been clicked.
 *
 * @example
 * const buttonSelectors = ["#button1", "#button2", "#button3"];
 * await iterateAndClickArrayButton(buttonSelectors, 0, false, 500);
 * // This will click the buttons starting from the first button and wait 500ms between each click.
 */
const iterateAndClickArrayButton = async (
  array: string[],
  isBackwards?,
  intervalTimeInMS = 1000,
  startIndex = 0,
) => {
  const step = isBackwards ? -1 : 1;
  for (let i = startIndex; i < array.length; i += step) {
    await new Promise(r => setTimeout(r, intervalTimeInMS));
    const button = await $(array[i].replace("${index}", String(i)));
    await button.click();
  }
};

export {iterateAndClickArrayButton};
