interface Logger {
  log: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

interface Formatter {
  format: (message: string) => string;
}

type Level = "info" | "warn" | "error";

class EmbraceLogger implements Logger, Formatter {
  public out: Logger;
  public level: Level[];

  constructor(out: Logger, level: Level[] = ["info", "warn", "error"]) {
    this.out = out;
    this.level = level;
  }

  public format(message: string): string {
    return `[Embrace] ${message}`;
  }

  public log(message: string) {
    if (this.level.includes("info")) {
      this.out.log(this.format(message));
    }
  }

  public warn(message: string) {
    if (this.level.includes("warn")) {
      this.out.warn(this.format(message));
    }
  }

  public error(message: string) {
    if (this.level.includes("error")) {
      this.out.error(this.format(message));
    }
  }
}

export default EmbraceLogger;
