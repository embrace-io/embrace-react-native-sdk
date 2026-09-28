const CONSOLE_METHODS = ["log", "info", "warn", "error", "debug"] as const;
const EMBRACE_PREFIX = "[Embrace]";

type ConsoleMethod = (typeof CONSOLE_METHODS)[number];

const originalConsole = CONSOLE_METHODS.reduce(
  (methods, method) => ({...methods, [method]: console[method].bind(console)}),
  {} as Record<ConsoleMethod, (...args: unknown[]) => void>,
);

const isEmbraceMessage = (args: unknown[]) =>
  typeof args[0] === "string" && args[0].startsWith(EMBRACE_PREFIX);

beforeEach(() => {
  CONSOLE_METHODS.forEach(method => {
    jest.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      if (!isEmbraceMessage(args)) {
        originalConsole[method](...args);
      }
    });
  });
});
