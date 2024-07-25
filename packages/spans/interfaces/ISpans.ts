export interface Attributes {
  [key: string]: string;
}
export interface Events {
  name: string;
  timeStampMs: number;
  attributes?: Attributes;
}

export type SPAN_ERROR_CODES = "None" | "Failure" | "UserAbandon" | "Unknown";
