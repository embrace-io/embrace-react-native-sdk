import {driver} from "@wdio/globals";

// TODO EMBR-4922 remove after pointing browserstack to full test suite
describe("Simple", () => {
  it("simple test", async () => {
    const tracerProviderScreen = await driver.$("~SPAN TESTING");
    await tracerProviderScreen.click();
    await new Promise(r => setTimeout(r, 1000));
    const response = await fetch("https://example.com");
    expect(response.ok).toBe(true);
  });
});
