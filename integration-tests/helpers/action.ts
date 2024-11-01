import {driver} from "@wdio/globals";
interface ActionButtons {
  LOG: {
    ERROR: () => Promise<void>;
    INFO: () => Promise<void>;
    WARN: () => Promise<void>;
  };
  NAVIGATE: {
    TRACER: () => Promise<void>;
    LOG: () => Promise<void>;
    OTLP: () => Promise<void>;
  };
  SPAN: {
    BASIC: () => Promise<void>;
    NESTED: () => Promise<void>;
    TEST: () => Promise<void>;
  };
}
const pressButton = async (identifier: string) => {
  await driver.$(identifier).click();
};
const ACTION_BUTTONS: ActionButtons = {
  LOG: {
    ERROR: () => pressButton("~LOG error"),
    INFO: () => pressButton("~LOG info"),
    WARN: () => pressButton("~LOG warn"),
  },
  NAVIGATE: {
    TRACER: () => pressButton("~TRACER PROVIDER TESTING"),
    LOG: () => pressButton("~LOG TESTING"),
    OTLP: () => pressButton("~EMBRACE OTLP"),
  },
  SPAN: {
    BASIC: () => pressButton("~GENERATE BASIC SPAN"),
    NESTED: () => pressButton("~GENERATE NESTED SPANS"),
    TEST: () => pressButton("~GENERATE TEST SPANS"),
  },
};

export {ACTION_BUTTONS};
