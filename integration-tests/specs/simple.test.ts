import {driver} from "@wdio/globals";
import {tap} from "../helpers/app";

// TODO EMBR-4922 remove after pointing browserstack to full test suite
describe("Simple", () => {
  it("simple test", async () => {
    await tap("SPAN TESTING", 1000);
    const currentScreen = await driver.$("~SPAN TESTING");
    expect(await currentScreen.isDisplayed()).toBe(true);
  });
});
