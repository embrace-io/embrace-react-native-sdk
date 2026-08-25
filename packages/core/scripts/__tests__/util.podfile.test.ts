import {applyEmbracePatches} from "../util/podfile";

const path = require("path");
const fs = require("fs");

const readMockFile = (name: string) =>
  fs.readFileSync(path.join(__dirname, "__mocks__", "ios", name)).toString();

describe("Podfile transforms", () => {
  const patchResult = applyEmbracePatches(
    readMockFile("PodfileWithoutEmbrace"),
  );

  it("applies the expected patches to a Podfile", () => {
    expect(patchResult.contents).toEqual(readMockFile("PodfileWithEmbrace"));
  });

  it("does not accumulate anything on a re-run", () => {
    const repeatPatchResult = applyEmbracePatches(patchResult.contents);
    expect(repeatPatchResult.contents).toEqual(patchResult.contents);
  });

  it("patches a Podfile with the KSCrash pod", () => {
    const KSCrashPatchResult = applyEmbracePatches(
      readMockFile("PodfileLegacyKSCrash"),
    );

    expect(KSCrashPatchResult.contents).toEqual(
      readMockFile("PodfileWithEmbrace"),
    );
  });

  it("reports the anchors it could not find and leaves the Podfile alone", () => {
    const contents = "source 'https://cdn.cocoapods.org/'\n";

    expect(applyEmbracePatches(contents)).toEqual({
      contents,
      error:
        "Could not patch the Podfile, could not find: `platform :ios`, `post_install do |installer|`",
    });
  });
});
