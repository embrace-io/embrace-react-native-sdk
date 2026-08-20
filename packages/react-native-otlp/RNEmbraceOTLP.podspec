require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
embrace_ios_sdk_version = package["embrace"]["iosVersion"]
otel_swift_version = package["embrace"]["otelSwiftVersion"]
# Exporters ship from opentelemetry-swift which is versioned separately
otel_swift_exporter_version = '2.1.0'
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

# Sourcing the Embrace iOS SDK from SPM is opt-in: EMBRACE_USE_SPM=1.
embrace_use_spm = %w[1 true yes].include?(ENV['EMBRACE_USE_SPM'].to_s.downcase)

Pod::Spec.new do |s|
  s.name = "RNEmbraceOTLP"
  s.version = package["version"]
  s.summary = package["description"]
  s.homepage = package["homepage"]
  s.license = package["license"]
  s.authors = package["author"]

  s.platforms = { :ios => min_ios_version_supported }
  s.source = { :git => ".git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.ios.deployment_target = '13.0'
  s.swift_version = '5.0'

  if embrace_use_spm
    unless respond_to?(:spm_dependency, true)
      raise "EMBRACE_USE_SPM is set, but SPM support is not available. Please ensure you are using React Native 0.75 or later."
    end

    spm_dependency(s,
      url: 'https://github.com/embrace-io/embrace-apple-sdk.git',
      requirement: {kind: 'exactVersion', version: embrace_ios_sdk_version},
      products: ['EmbraceIO', 'EmbraceCrash', 'EmbraceSemantics']
    )

    spm_dependency(s,
      url: 'https://github.com/open-telemetry/opentelemetry-swift.git',
      requirement: {kind: 'exactVersion', version: otel_swift_exporter_version},
      products: ['OpenTelemetryProtocolExporterHTTP']
    )

    spm_dependency(s,
      url: 'https://github.com/open-telemetry/opentelemetry-swift-core.git',
      requirement: {kind: 'upToNextMajorVersion', minimumVersion: otel_swift_version},
      products: ['OpenTelemetryApi', 'OpenTelemetrySdk']
    )

    # Xcode 16+ Explicitly Built Modules can't resolve SPM package-framework modules via CocoaPods.
    s.pod_target_xcconfig = {
      'SWIFT_ENABLE_EXPLICIT_MODULES' => 'NO',
      'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => '$(inherited) EMBRACE_USE_SPM'
    }
  else
    s.dependency 'EmbraceIO', embrace_ios_sdk_version
    s.dependency 'OpenTelemetry-Swift-Protocol-Exporter-Http', otel_swift_exporter_version
  end

  # Use install_modules_dependencies helper to install the dependencies if React Native version >=0.71.0.
  # See https://github.com/facebook/react-native/blob/febf6b7f33fdb4904669f99d795eba4c0f95d7bf/scripts/cocoapods/new_architecture.rb#L79.
  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"
    
    # Don't install the dependencies when we run `pod install` in the old architecture.
    if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
      s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
      s.pod_target_xcconfig = {
          "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
          "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
          "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
      }

      s.dependency "React-Codegen"
      s.dependency "RCT-Folly"
      s.dependency "RCTRequired"
      s.dependency "RCTTypeSafety"
      s.dependency "ReactCommon/turbomodule/core"
    end
  end
end