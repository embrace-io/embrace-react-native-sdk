import {NativeModules} from "react-native";

import {Attributes, Events, SPAN_ERROR_CODES} from "../interfaces/ISpans";

import {createFalsePromise, validateAndLogRequiredProperties} from "./Utils";

export const startSpan = (
  name: string,
  parentSpanId?: string,
  startTimeMs: number = 0,
): Promise<boolean | string> => {
  if (!validateAndLogRequiredProperties({name})) {
    return createFalsePromise();
  }
  try {
    return NativeModules.EmbraceManager.startSpan(
      name,
      parentSpanId,
      startTimeMs,
    );
  } catch (e) {
    console.warn(
      `[Embrace] The method startSpan was not found, please update the SDK.`,
      e,
    );
    return createFalsePromise();
  }
};

export const stopSpan = (
  spanId: string,
  errorCode: SPAN_ERROR_CODES = "None",
  endTimeMs: number = 0,
): Promise<boolean> => {
  if (!validateAndLogRequiredProperties({spanId})) {
    return createFalsePromise();
  }
  try {
    return NativeModules.EmbraceManager.stopSpan(spanId, errorCode, endTimeMs);
  } catch (e) {
    console.warn(
      `[Embrace] The method stopSpan was not found, please update the SDK.`,
      e,
    );
    return createFalsePromise();
  }
};

export const addSpanEventToSpan = (
  spanId: string,
  name: string,
  timeStampMs: number,
  attributes?: Attributes,
): Promise<boolean> => {
  if (!validateAndLogRequiredProperties({name, spanId, timeStampMs})) {
    return createFalsePromise();
  }
  try {
    return NativeModules.EmbraceManager.addSpanEventToSpan(
      spanId,
      name,
      timeStampMs,
      attributes,
    );
  } catch (e) {
    console.warn(
      `[Embrace] The method addSpanEventToSpan was not found, please update the SDK.`,
      e,
    );
    return createFalsePromise();
  }
};

export const addSpanAttributeToSpan = (
  spanId: string,
  key: string,
  value: string,
): Promise<boolean> => {
  if (!validateAndLogRequiredProperties({spanId, key, value})) {
    return createFalsePromise();
  }
  try {
    return NativeModules.EmbraceManager.addSpanAttributeToSpan(
      spanId,
      key,
      value,
    );
  } catch (e) {
    console.warn(
      `[Embrace] The method addSpanAttributeToSpan was not found, please update the SDK.`,
      e,
    );
    return createFalsePromise();
  }
};

export const recordSpan = async (
  name: string,
  callback: () => void | Promise<void>,
  attributes?: Attributes,
  events?: Events[],
  parentSpanId?: string,
): Promise<boolean> => {
  if (!validateAndLogRequiredProperties({name}) || !callback) {
    callback();
    return createFalsePromise();
  }
  let id = "";
  try {
    id = await NativeModules.EmbraceManager.startSpan(name, parentSpanId, 0);
  } catch (e) {
    console.warn(
      `[Embrace] The method startSpan was not found, please update the SDK.`,
      e,
    );
    return createFalsePromise();
  }

  if (!id || id === "") {
    callback();
    return createFalsePromise();
  }

  if (attributes && Object.values(attributes).length > 0) {
    for (const [key, value] of Object.entries(attributes)) {
      if (validateAndLogRequiredProperties({key, value})) {
        NativeModules.EmbraceManager.addSpanAttributeToSpan(
          id,
          key.toString(),
          value.toString(),
        );
      }
    }
  }

  if (events && events.length > 0) {
    events.forEach(event => {
      NativeModules.EmbraceManager.addSpanEventToSpan(
        id,
        event.name,
        event.timeStampMs,
        event.attributes,
      );
    });
  }

  try {
    if (callback instanceof Promise) {
      await callback;
    } else {
      await callback();
    }
  } catch (e) {
    await NativeModules.EmbraceManager.stopSpan(id, "Failure", 0);
    throw e;
  }
  return NativeModules.EmbraceManager.stopSpan(id, "None", 0);
};

export const recordCompletedSpan = (
  name: string,
  startTimeMs: number,
  endTimeMs: number,
  errorCode: SPAN_ERROR_CODES = "None",
  parentSpanId?: string,
  attributes?: Attributes,
  events?: Events[],
): Promise<boolean> => {
  if (!validateAndLogRequiredProperties({name, startTimeMs, endTimeMs})) {
    return createFalsePromise();
  }
  try {
    return NativeModules.EmbraceManager.recordCompletedSpan(
      name,
      startTimeMs,
      endTimeMs,
      errorCode,
      parentSpanId,
      attributes,
      events || [],
    );
  } catch (e) {
    console.warn(
      `[Embrace] The method recordCompletedSpan was not found, please update the SDK.`,
      e,
    );
    return createFalsePromise();
  }
};
