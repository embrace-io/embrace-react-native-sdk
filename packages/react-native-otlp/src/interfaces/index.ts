import {IOSConfig, AndroidConfig} from "./common/index";

interface ExporterConfig {
  endpoint: string;
  headers?: {key: string; token: string}[];
  timeout?: number;
}

interface OTLPExporterConfig {
  logExporter?: ExporterConfig;
  traceExporter?: ExporterConfig;
}

export {IOSConfig, AndroidConfig, OTLPExporterConfig, ExporterConfig};
