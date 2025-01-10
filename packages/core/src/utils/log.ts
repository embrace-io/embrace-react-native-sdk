const generateStackTrace = (): string => {
  const err = new Error();
  return err.stack || "";
};

export {generateStackTrace};
