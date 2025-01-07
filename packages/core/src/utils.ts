const generateStackTrace = (): string => {
  const err = new Error();
  return err.stack || "";
};

const buildPackageVersion = (reactNativeVersion: {
  version: {
    major: string;
    minor: string;
    patch: string;
    prerelease: string | null;
  };
}): string | void => {
  const isObjectNonEmpty = (obj?: object): boolean =>
    Object.keys(obj || {}).length > 0;

  if (
    isObjectNonEmpty(reactNativeVersion) &&
    isObjectNonEmpty(reactNativeVersion.version)
  ) {
    const {major, minor, patch, prerelease} = reactNativeVersion.version;

    const versionStr = `${major || "0"}.${minor || "0"}.${patch || "0"}`;
    return prerelease ? `${versionStr}.${prerelease}` : versionStr;
  }
};

export {generateStackTrace, buildPackageVersion};
