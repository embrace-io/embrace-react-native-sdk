import {
  EmbraceLogData,
  EmbracePayloadLogs,
  ParsedLogPayload,
} from "../typings/embrace";

type SEVERITY_TYPES = "warn" | "info" | "error";
interface SeverityNumbers {
  [key: number]: SEVERITY_TYPES;
}
const EMBRACE_INTERNAL_LOG_SEVERITY_NUMBER: SeverityNumbers = {
  13: "warn",
  9: "info",
  17: "error",
};

const getAttributeValue = (log: EmbraceLogData, key: string): string =>
  log.attributes.find(attr => attr.key === key)?.value || "";

/**
 * Log severity are all included on the same array in the payload, to make testing easier separate them into
 * categories and sort them
 */
const parseLogPayload = (payload: EmbracePayloadLogs): ParsedLogPayload => {
  const parsedLog = {
    info: [],
    warn: [],
    error: [],
    metadata: undefined,
    resource: undefined,
  };

  payload.data.logs.forEach(log => {
    const logType = EMBRACE_INTERNAL_LOG_SEVERITY_NUMBER[log.severity_number];
    parsedLog[logType].push(log);
  });
  parsedLog.metadata = payload.metadata;
  //TODO See how can we check these two attributes using REGEX or something
  delete payload.resource.process_start_time;
  delete payload.resource.process_identifier;
  parsedLog.resource = payload.resource;

  return parsedLog;
};

export {
  getAttributeValue,
  parseLogPayload,
  EMBRACE_INTERNAL_LOG_SEVERITY_NUMBER,
};
