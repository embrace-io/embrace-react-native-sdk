def load_dependencies(spec = nil)
  if spec.nil?
    # pod 'OpenTelemetrySwiftApi', '~> 1.6.0'
    pod 'EmbraceIO-DEV'
  else
    # spec.dependency 'OpenTelemetrySwiftApi', '~> 1.6.0'
    spec.dependency 'EmbraceIO-DEV'
  end
end
