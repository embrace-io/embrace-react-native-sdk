import {EmbraceLoggerLevel} from "../interfaces";

interface Logger {
  log: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

interface Formatter {
  format: (message: string) => string;
}

class EmbraceLogger implements Logger, Formatter {
  public out: Logger;
  public level: EmbraceLoggerLevel;

  constructor(out: Logger, level: EmbraceLoggerLevel = "info") {
    this.out = out;
    this.level = level;
  }

  public format(message: string): string {
    return `[Embrace] ${message}`;
  }

  public log(message: string) {
    if (this.level === "info") {
      this.out.log(this.format(message));
    }
  }

  public warn(message: string) {
    if (this.level === "warn" || this.level === "info") {
      this.out.warn(this.format(message));
    }
  }

  public error(message: string) {
    // always print errors
    this.out.error(this.format(message));
  }
}

export default EmbraceLogger;
