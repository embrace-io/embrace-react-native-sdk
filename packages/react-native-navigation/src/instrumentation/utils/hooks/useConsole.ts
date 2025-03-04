import {useMemo} from "react";

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

const useConsole = (debug: boolean) =>
  useMemo(() => {
    if (debug) {
      return console;
    }

    return consoleStub;
  }, [debug]);

export default useConsole;
export type ConsoleStub = typeof consoleStub;
