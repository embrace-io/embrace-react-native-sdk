require "json"
package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name = "RNEmbraceOTLP"
  s.version = package["version"]
  s.summary = package["description"]
  s.homepage = package["homepage"]
  s.license = package["license"]
  s.authors = package["author"]

  s.ios.deployment_target = '13.0'
  s.swift_version = '5.8'

  s.source_files = "ios/RNEmbraceOTLP/**/*.{h,m,mm,swift}"
  s.source = { :path => "ios/RNEmbraceOTLP/" }

  s.dependency 'React-Core'
  s.dependency 'SwiftProtobuf', '1.20.2'
  s.dependency 'EmbraceInternalSwiftLog', '1.4.4-internal'
  s.dependency 'EmbraceIO', '6.4.1'

  # not ready yet to be added
  # s.dependency 'EmbraceInternalGrpcSwift'
end