import {Link} from "@opentelemetry/api/build/src/trace/link";
import {Attributes, TimeInput} from "@opentelemetry/api";

/**
 * Several different primitive types are valid as TimeInput, normalize to a number representing epoch milliseconds
 * to simplify communication with the native modules
 *
 * See https://reactnative.dev/docs/native-modules-android#argument-types and https://reactnative.dev/docs/native-modules-ios#argument-types
 */
export const normalizeTime = (time?: TimeInput): number => {
  if (time === undefined) {
    return 0;
  }

  if (typeof time === "number") {
    return time;
  }

  if (time instanceof Date) {
    return time.getTime();
  }

  // HrTime
  if (Array.isArray(time) && time.length === 2) {
    const epochMilliseconds = time[0] * 1000;
    const extraMilliseconds = Math.round(time[1] / 1e6);
    return epochMilliseconds + extraMilliseconds;
  }

  return 0;
};

/**
 * Parsing is handled on the native side, just need to make sure it is always defined
 */
export const normalizeAttributes = (attributes?: Attributes) => {
  return attributes || {};
};

/**
 * Parsing is handled on the native side, just need to make sure it is always defined
 */
export const normalizeLinks = (links?: Link[]) => {
  return links || [];
};

export const isAttributes = (
  attributesOrTimeInput: Attributes | TimeInput | undefined,
): attributesOrTimeInput is Attributes => {
  return (
    typeof attributesOrTimeInput === "object" &&
    !(attributesOrTimeInput instanceof Date) &&
    !Array.isArray(attributesOrTimeInput)
  );
};
