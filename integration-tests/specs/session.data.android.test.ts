// import {driver} from "@wdio/globals";
// import {getSessionPayloads} from "../helpers/embrace_server";

// import {getCurrentSessionId} from "../helpers/session";

// const androidApplicationData = {
//   app_version: "1.0.0",
//   build: "1",
//   sdkversion: "6.9.2",
//   framework: 2,
//   build_type: "release",
// };
// const androidDeviceData = {
//   architecture: "x86_64",
//   locale: "en_US",
//   manufacturer: "Google",
//   model: "sdk_gphone64_x86_64",
//   num_cores: 4,
//   ostype: "android",
//   osversion: "13",
//   osversion_code: 33,
//   timezone: "GMT",
// };

// describe("Session data - Android", () => {
//   it("should contain the correct application data", async () => {
//     const currentSessionId = await getCurrentSessionId(driver);

//     await driver.execute("mobile: backgroundApp", {seconds: 2});

//     const sessionPayloads = await getSessionPayloads(currentSessionId);

//     expect(sessionPayloads.Events.length).toBe(1);
//     const {application} = sessionPayloads.Events[0];
//     Object.entries(androidApplicationData).forEach(([key, value]) => {
//       expect(application[key]).toBe(value);
//     });
//   });
//   it("should contain the correct device info data", async () => {
//     const currentSessionId = await getCurrentSessionId(driver);

//     await driver.execute("mobile: backgroundApp", {seconds: 2});

//     const sessionPayloads = await getSessionPayloads(currentSessionId);

//     expect(sessionPayloads.Events.length).toBe(1);
//     const {device} = sessionPayloads.Events[0];
//     Object.entries(androidDeviceData).forEach(([key, value]) => {
//       expect(device[key]).toBe(value);
//     });
//   });
// });
