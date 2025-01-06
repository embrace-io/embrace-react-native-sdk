interface Logger {
  log: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

interface MessageFormatter {
  format: (message: string) => string;
}

class EmbraceLogger implements Logger, MessageFormatter {
  public out: Logger;
  public enabled: boolean;

  constructor(out: Logger, enabled = true) {
    this.out = out;
    this.enabled = enabled;
  }

  public format(message: string): string {
    return `[Embrace] ${message}`;
  }

  public log(message: string) {
    if (this.enabled) {
      this.out.log(this.format(message));
    }
  }

  public warn(message: string) {
    if (this.enabled) {
      this.out.warn(this.format(message));
    }
  }

  public error(message: string) {
    if (this.enabled) {
      this.out.error(this.format(message));
    }
  }
}

export default EmbraceLogger;
