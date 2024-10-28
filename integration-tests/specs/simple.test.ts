import {driver} from "@wdio/globals";

describe("Simple", () => {
  it("simple test", async () => {
    const tracerProviderScreen = await driver.$("~TRACER PROVIDER TESTING");
    await tracerProviderScreen.click();
    await new Promise(r => setTimeout(r, 1000));
    const response = await fetch("https://example.com");
    expect(response.ok).toBe(true);
  });
});
