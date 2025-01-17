const consoleStub = {
  log: (..._: unknown[]) => {},
  warn: (..._: unknown[]) => {},
  error: (..._: unknown[]) => {},
  info: (..._: unknown[]) => {},
  trace: (..._: unknown[]) => {},
  debug: (..._: unknown[]) => {},
  table: () => {},
  group: (_?: string) => {},
  groupCollapsed: (_?: string) => {},
  groupEnd: () => {},
};

export default (debug: boolean) => {
  if (debug) {
    return console;
  }

  return consoleStub;
};
