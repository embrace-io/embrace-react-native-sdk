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
  private isColorSupported: boolean;

  constructor(out: Logger, level: EmbraceLoggerLevel = "info") {
    this.out = out;
    this.level = level;
    this.isColorSupported = process.stdout.isTTY;
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
      this.out.warn(this.yellow(this.format(message)));
    }
  }

  public error(message: string) {
    // always print errors
    this.out.error(this.red(this.format(message)));
  }

  private red(message: string) {
    if (this.isColorSupported) {
      return `\x1b[31m${message}\x1b[0m`;
    }

    return message;
  }

  private yellow(message: string) {
    if (this.isColorSupported) {
      return `\x1b[33m${message}\x1b[0m`;
    }

    return message;
  }
}

export default EmbraceLogger;
