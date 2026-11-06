// swift-tools-version: 6.0
import PackageDescription

let reactHeaders: [Target.Dependency] = [
    .product(name: "ReactHeaders", package: "ReactNative"),
    .product(name: "ReactNativeHeaders", package: "ReactNative"),
    .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative")
]

let package = Package(
    name: "RNEmbraceCore",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "RNEmbraceCore", targets: ["RNEmbraceCoreBridge"])
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
        .package(url: "https://github.com/embrace-io/embrace-apple-sdk.git", exact: "6.22.1"),
        .package(url: "https://github.com/open-telemetry/opentelemetry-swift-core.git", from: "2.1.1")
    ],
    targets: [
        .target(
            name: "RNEmbraceCore",
            dependencies: reactHeaders + [
                .product(name: "EmbraceIO", package: "embrace-apple-sdk"),
                .product(name: "OpenTelemetryApi", package: "opentelemetry-swift-core")
            ],
            path: "ios/Swift",
            swiftSettings: [.define("EMBRACE_USE_SPM"), .swiftLanguageMode(.v5)]
        ),
        .target(
            name: "RNEmbraceCoreBridge",
            dependencies: reactHeaders + [
                "RNEmbraceCore",
                .product(name: "ReactAppHeaders", package: "React-GeneratedCode")
            ],
            path: "ios",
            exclude: ["Swift", "scripts", "Info.plist", "RNEmbraceCore-Bridging-Header.h"],
            publicHeadersPath: ".",
            cSettings: [.define("RCT_NEW_ARCH_ENABLED", to: "1")],
            cxxSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
                .define("DEBUG", .when(configuration: .debug)),
                .define("NDEBUG", .when(configuration: .release)),
                .unsafeFlags(["-I", "${GENERATED_MODULEMAP_DIR}"])
            ]
        )
    ],
    cxxLanguageStandard: .cxx20
)
