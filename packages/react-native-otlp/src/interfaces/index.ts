interface ExporterConfig {
  endpoint: string;
  headers?: {key: string; token: string}[];
  timeout?: number;
}

interface OTLPExporterConfig {
  logExporter?: ExporterConfig;
  traceExporter?: ExporterConfig;
}

export * from "./common/types";
export * from "./common/interfaces";
export {OTLPExporterConfig, ExporterConfig};
