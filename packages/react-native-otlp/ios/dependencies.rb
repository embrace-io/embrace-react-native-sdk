require "json"

def load_dependencies(s = nil)
  package = JSON.parse(File.read(File.join(__dir__, "../package.json")))
  if s.nil?
    pod 'EmbraceIO', package["embrace"]["iosVersion"]
    pod 'SwiftProtobuf', package["embrace"]["swiftProtobufVersion"]
    pod 'EmbraceInternalSwiftLog', package["embrace"]["swiftLogVersion"]
  else
    s.dependency 'EmbraceIO', package["embrace"]["iosVersion"]
    s.dependency 'SwiftProtobuf', package["embrace"]["swiftProtobufVersion"]
    s.dependency 'EmbraceInternalSwiftLog', package["embrace"]["swiftLogVersion"]
  end
end
