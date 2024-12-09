require "json"

def load_dependencies(s = nil)
  package = JSON.parse(File.read(File.join(__dir__, "../package.json")))
  if s.nil?
    pod 'EmbraceIO', package["embrace"]["iosVersion"]
  else
    s.dependency 'EmbraceIO', package["embrace"]["iosVersion"]
  end
end
