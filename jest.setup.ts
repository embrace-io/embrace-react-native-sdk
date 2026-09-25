const CONSOLE_METHODS = ["log", "info", "warn", "error", "debug"] as const;

beforeEach(() => {
  CONSOLE_METHODS.forEach(method => {
    jest.spyOn(console, method).mockImplementation(() => {});
  });
});
