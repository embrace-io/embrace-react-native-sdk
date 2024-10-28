require "json"

def load_dependencies(s = nil)
  package = JSON.parse(File.read(File.join(__dir__, "../package.json")))
  if s.nil?
    pod 'EmbraceIO', package["embrace"]["iosVersion"]
    pod 'SwiftProtobuf', "1.20.2"
    pod 'EmbraceInternalSwiftLog', "1.4.4-internal"
  else
    s.dependency 'EmbraceIO', package["embrace"]["iosVersion"]
    s.dependency 'SwiftProtobuf', "1.20.2"
    s.dependency 'EmbraceInternalSwiftLog', "1.4.4-internal"
  end
end
