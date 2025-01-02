const generateStackTrace = (): string => {
  const err = new Error();
  return err.stack || "";
};

const isObjectNonEmpty = (obj?: object): boolean =>
  Object.keys(obj || {}).length > 0;

const buildPackageVersion = ({
  major,
  minor,
  patch,
  prerelease,
}: {
  major: string;
  minor: string;
  patch: string;
  prerelease: string | null;
}): string => {
  const versionStr = `${major || "0"}.${minor || "0"}.${patch || "0"}`;
  return prerelease ? `${versionStr}.${prerelease}` : versionStr;
};

export {generateStackTrace, buildPackageVersion, isObjectNonEmpty};
