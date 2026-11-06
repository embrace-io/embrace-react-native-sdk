const path = require("path");
const fs = require("fs");

const packageRoot = path.join(__dirname, "..", "..");
const manifest = fs
  .readFileSync(path.join(packageRoot, "Package.swift"))
  .toString();
const {embrace} = JSON.parse(
  fs.readFileSync(path.join(packageRoot, "package.json")).toString(),
);

describe("Package.swift", () => {
  it("pins the Embrace Apple SDK to iosVersion", () => {
    expect(manifest).toContain(
      `embrace-apple-sdk.git", exact: "${embrace.iosVersion}"`,
    );
  });

  it("requires opentelemetry-swift-core from otelSwiftVersion", () => {
    expect(manifest).toContain(
      `opentelemetry-swift-core.git", from: "${embrace.otelSwiftVersion}"`,
    );
  });
});
