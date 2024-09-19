require "json"

def load_dependencies(spec = nil)
  package = JSON.parse(File.read(File.join(__dir__, "../package.json")))
  if spec.nil?
    pod 'EmbraceIO', package["embrace"]["iosVersion"]
  else
    spec.dependency 'EmbraceIO', package["embrace"]["iosVersion"]
  end
end
