import * as fs from "fs";

import {getXcodeProject, projectNameToBridgingHeader} from "../util/ios";

describe("iOS utils", () => {
  it("can determine bridging header name when there is a product module name", async () => {
    const project = await getXcodeProject(
      "./packages/core/scripts/__tests__/__mocks__/ios/hasProductModuleName.xcodeproj/project.pbxproj",
    );
    expect(project.getBridgingHeaderName("EmbraceTestSuite")).toBe(
      "MyProductModule-Swift.h",
    );
  });

  it("can determine bridging header name when there is not a product module name", async () => {
    const project = await getXcodeProject(
      "./packages/core/scripts/__tests__/__mocks__/ios/testMock.xcodeproj/project.pbxproj",
    );
    expect(project.getBridgingHeaderName("EmbraceTestSuite")).toBe(
      "EmbraceTestSuite-Swift.h",
    );
  });

  it.each([
    {input: "normal", expected: "normal-Swift.h"},
    {input: "123projectName", expected: "_23projectName-Swift.h"},
    {input: "some-non-al$ha_", expected: "some_non_al_ha_-Swift.h"},
  ])(
    "converts invalid characters in bridging header %#",
    ({input, expected}) => {
      expect(projectNameToBridgingHeader(input)).toBe(expected);
    },
  );

  it("can add a bridging header if it doesn't already exist", async () => {
    const tmp = "./packages/core/scripts/__tests__/tmp/";
    const projectDir = `${tmp}/EmbraceTestSuite`;
    const xcodeProj = `${tmp}/bridgingTest.xcodeproj`;

    fs.existsSync(xcodeProj) && fs.rmdirSync(xcodeProj, {recursive: true});
    fs.mkdirSync(xcodeProj, {recursive: true});
    fs.existsSync(projectDir) && fs.rmdirSync(projectDir, {recursive: true});
    fs.mkdirSync(projectDir, {recursive: true});

    fs.copyFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/testMock.xcodeproj/project.pbxproj",
      `${xcodeProj}/project.pbxproj`,
    );

    const project = await getXcodeProject(`${xcodeProj}/project.pbxproj`);

    const result = await project.addBridgingHeader("EmbraceTestSuite");

    expect(result).toBe(true);

    const addedHeader = fs.readFileSync(
      `${projectDir}/EmbraceTestSuite-Bridging-Header.h`,
    );
    const expectedHeader = fs.readFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/BridgingHeader.h",
    );
    expect(addedHeader.toString()).toEqual(expectedHeader.toString());

    const updatedPBX = fs.readFileSync(`${xcodeProj}/project.pbxproj`);
    expect(
      updatedPBX
        .toString()
        .includes(
          'SWIFT_OBJC_BRIDGING_HEADER = "EmbraceTestSuite-Bridging-Header.h";',
        ),
    ).toBe(true);
  });

  it("does not add a bridging header if it already exist", async () => {
    const tmp = "./packages/core/scripts/__tests__/tmp/";
    const projectDir = `${tmp}/EmbraceTestSuite`;
    const xcodeProj = `${tmp}/bridgingTest.xcodeproj`;

    fs.existsSync(xcodeProj) && fs.rmdirSync(xcodeProj, {recursive: true});
    fs.mkdirSync(xcodeProj, {recursive: true});
    fs.existsSync(projectDir) && fs.rmdirSync(projectDir, {recursive: true});
    fs.mkdirSync(projectDir, {recursive: true});

    fs.copyFileSync(
      "./packages/core/scripts/__tests__/__mocks__/ios/hasBridgingHeader.xcodeproj/project.pbxproj",
      `${xcodeProj}/project.pbxproj`,
    );

    const project = await getXcodeProject(`${xcodeProj}/project.pbxproj`);
    const result = await project.addBridgingHeader("EmbraceTestSuite");

    expect(result).toBe(true);
    expect(
      fs.existsSync(`${projectDir}/EmbraceTestSuite-Bridging-Header.h`),
    ).toBe(false);

    const pbx = fs.readFileSync(`${xcodeProj}/project.pbxproj`);
    expect(
      pbx
        .toString()
        .includes('SWIFT_OBJC_BRIDGING_HEADER = "existingHeader.h";'),
    ).toBe(true);
  });
});
