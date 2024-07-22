export interface Attributes {
  [key: string]: string;
}
export interface Events {
  name: string;
  timeStampMs?: number; // TODO this is required
  attributes?: Attributes;
}

export type SPAN_ERROR_CODES = "None" | "Failure" | "UserAbandon" | "Unknown";
