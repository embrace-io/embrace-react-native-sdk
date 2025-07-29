const fs = require("fs");

const writeIfNotExists = (
  filePath: string,
  contents: string,
  caller: string,
) => {
  try {
    const fd = fs.openSync(filePath, "wx");
    fs.writeFileSync(fd, contents);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e && e.message && e.message.includes("EEXIST")) {
      // Don't try and overwrite the file if it already exists
      return false;
    } else {
      throw new Error(`${caller} failed to write ${filePath}: ${e}`);
    }
  }

  return true;
};

export {writeIfNotExists};
