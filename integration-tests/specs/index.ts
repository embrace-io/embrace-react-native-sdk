/**
 * This file is used to define the list of test specs to be run by the WebdriverIO test runner. 
 * It exports an explicit array of test spec files so that tests are run in a specific order.
 * File paths are relative to the integration-tests directory, where the wdio config files live.
 * 
 * When adding a new test spec, add it to this list in the order you want it to run.
 */
const specs = [
    "./specs/startup.test.ts", // startup tests run first to capture the full app startup telemetry
    "./specs/session.test.ts",
    "./specs/tracer_provider.test.ts",
    "./specs/navigation.test.ts",
    "./specs/network.test.ts",
    "./specs/user.test.ts",
    "./specs/redux.test.ts",
    "./specs/logs.test.ts", // logs tests run last since they crash the app
]

export default specs;
