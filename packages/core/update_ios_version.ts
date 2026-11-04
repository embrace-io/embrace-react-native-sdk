// Copies the Embrace and OpenTelemetry versions from `package.json` into `Package.swift`
// `Package.swift` can't read them itself: SwiftPM caches the manifest and only re-reads it when the file changes
{
  const fs = require("fs");

  const {embrace} = require("./package.json");

  const manifest = fs
    .readFileSync("Package.swift", "utf8")
    .replace(
      /(embrace-apple-sdk\.git", exact: ")[^"]*/,
      `$1${embrace.iosVersion}`,
    )
    .replace(
      /(opentelemetry-swift-core\.git", from: ")[^"]*/,
      `$1${embrace.otelSwiftVersion}`,
    );

  fs.writeFileSync("Package.swift", manifest, "utf8");
}
