export interface Attributes {
  [key: string]: string;
}
export interface Events {
  name: string;
  timestampNanos?: number;
  attributes?: Attributes;
}

export type SPAN_ERROR_CODES = 'None' | 'Failure' | 'UserAbandon' | 'Unknown';
