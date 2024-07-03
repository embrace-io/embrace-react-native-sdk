def load_dependencies(spec = nil)
  if spec.nil?
    pod 'OpenTelemetrySwiftApi', '~> 1.6.0'
  else
    spec.dependency "OpenTelemetrySwiftApi", "~> 1.6.0"
  end
end
