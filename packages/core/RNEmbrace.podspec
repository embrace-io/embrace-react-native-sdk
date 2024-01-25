Pod::Spec.new do |s|
  s.name         = "RNEmbrace"
  s.version      = "1.1.1"
  s.summary      = "A React Native wrapper for Embrace SDK"

  s.license      = "ISC"
  s.authors      = { "Embrace.io" => "truenorth@embrace.io" }
  s.ios.deployment_target = '9.0'
  s.tvos.deployment_target = '10.0'

  s.source_files = 'ios/RNEmbrace/*.{h,m}'
  s.source = {:path => "ios/RNEmbrace/"}

  s.dependency 'React-Core'
  s.dependency 'EmbraceIO', '5.24.3'

  s.homepage     = "https://embrace.io/"

end
