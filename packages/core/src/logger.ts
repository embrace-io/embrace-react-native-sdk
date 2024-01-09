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

  constructor(out: Logger) {
    this.out = out;
  }

  public format(message: string): string {
    return `[Embrace] ${message}`;
  }

  public log(message: string) {
    this.out.log(this.format(message));
  }

  public warn(message: string) {
    this.out.warn(this.format(message));
  }

  public error(message: string) {
    this.out.error(this.format(message));
  }
}

export default EmbraceLogger;
