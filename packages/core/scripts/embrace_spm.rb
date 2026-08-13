# Mirrors the Embrace SPM dependencies our pods declare onto the app target.
#
# RN's spm_dependency helper attaches SPM products to the *pod* target. Xcode's embed-and-sign
# step belongs to the target that declares a package product, and CocoaPods' "Embed Pods
# Frameworks" script only knows about pods, so products declared that way are never copied into
# the app: Debug survives on an absolute rpath into DerivedData, Release crashes at launch with
# `Library not loaded: @rpath/...PackageProduct.framework`. Declaring the same products on the
# app target restores the embed phase, code signing and the normal @executable_path layout.
#
# Usage, from a Podfile's post_install:
#
#   require Pod::Executable.execute_command('node', ['-p',
#     'require.resolve(
#       "@embrace-io/react-native/scripts/embrace_spm.rb",
#       {paths: [process.argv[1]]},
#     )', __dir__]).strip
#
#   post_install do |installer|
#     embrace_spm_app_dependency(installer)
#   end

# Packages this helper is allowed to add to or remove from a user project. Anything the app
# developer added themselves stays untouched.
EMBRACE_SPM_MANAGED_URLS = [
  %r{github\.com/embrace-io/embrace-apple-sdk(\.git)?\z},
  %r{github\.com/open-telemetry/opentelemetry-swift(-core)?(\.git)?\z}
].freeze

EMBRACE_SPM_POD_PREFIX = "RNEmbrace".freeze

def embrace_spm_log(msg)
  Pod::UI.puts "[Embrace/SPM] #{msg}"
end

def embrace_spm_managed?(url)
  EMBRACE_SPM_MANAGED_URLS.any? { |pattern| url.to_s.match?(pattern) }
end

def embrace_spm_enabled?
  %w[1 true yes].include?(ENV["EMBRACE_USE_SPM"].to_s.downcase)
end

# Requirements come back from a project file with string keys and go in with symbols
def embrace_spm_normalize(requirement)
  (requirement || {}).map { |key, value| [key.to_s, value.to_s] }.sort
end

# What our pods resolved to, so the app target can never drift from them on version or product
# list. Returns { url => { requirement:, products: [] } }.
def embrace_spm_pod_dependencies(installer)
  wanted = {}

  installer.pods_project.targets.each do |target|
    next unless target.name.start_with?(EMBRACE_SPM_POD_PREFIX)
    next unless target.respond_to?(:package_product_dependencies)

    target.package_product_dependencies.each do |dep|
      package = dep.package
      next unless package.is_a?(Xcodeproj::Project::Object::XCRemoteSwiftPackageReference)
      next unless embrace_spm_managed?(package.repositoryURL)

      entry = wanted[package.repositoryURL] ||= {requirement: package.requirement, products: []}
      entry[:products] << dep.product_name unless entry[:products].include?(dep.product_name)
    end
  end

  wanted
end

def embrace_spm_app_targets(aggregate_target)
  aggregate_target.user_targets.select { |target| target.symbol_type == :application }
end

# Adds the packages/products to one target; returns true if the project was changed.
def embrace_spm_add(project, target, wanted)
  pkg_class = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference
  ref_class = Xcodeproj::Project::Object::XCSwiftPackageProductDependency
  changed = false

  wanted.each do |url, spec|
    package = project.root_object.package_references.find do |candidate|
      candidate.is_a?(pkg_class) && candidate.repositoryURL == url
    end

    unless package
      package = project.new(pkg_class)
      package.repositoryURL = url
      package.requirement = spec[:requirement]
      project.root_object.package_references << package
      embrace_spm_log("added package #{url}")
      changed = true
    end

    # Keep the app pinned to whatever the pods resolved to. Compare normalised, since a
    # requirement read back from a project file has string keys.
    if embrace_spm_normalize(package.requirement) != embrace_spm_normalize(spec[:requirement])
      embrace_spm_log("updating #{url} requirement to #{spec[:requirement]}")
      package.requirement = spec[:requirement]
      changed = true
    end

    spec[:products].each do |product_name|
      next if target.package_product_dependencies.any? do |dep|
        dep.package == package && dep.product_name == product_name
      end

      dep = project.new(ref_class)
      dep.package = package
      dep.product_name = product_name
      target.package_product_dependencies << dep
      embrace_spm_log("added #{product_name} to #{target.name}")
      changed = true
    end
  end

  changed
end

# Drops the packages/products we manage, so switching back to the CocoaPods pod doesn't leave the
# app linking Embrace twice. Returns true if the project was changed.
def embrace_spm_remove(project, targets)
  changed = false

  targets.each do |target|
    target.package_product_dependencies.dup.each do |dep|
      package = dep.package
      next unless package.is_a?(Xcodeproj::Project::Object::XCRemoteSwiftPackageReference)
      next unless embrace_spm_managed?(package.repositoryURL)

      target.package_product_dependencies.delete(dep)
      embrace_spm_log("removed #{dep.product_name} from #{target.name}")
      changed = true
    end
  end

  # Only drop the package itself once nothing references it any more
  project.root_object.package_references.dup.each do |package|
    next unless package.is_a?(Xcodeproj::Project::Object::XCRemoteSwiftPackageReference)
    next unless embrace_spm_managed?(package.repositoryURL)

    still_used = project.targets.any? do |target|
      target.respond_to?(:package_product_dependencies) &&
        target.package_product_dependencies.any? { |dep| dep.package == package }
    end
    next if still_used

    url = package.repositoryURL
    project.root_object.package_references.delete(package)
    # Delete the object too — a reference left orphaned in the file still takes part in package
    # resolution and can collide with another package providing the same products
    package.remove_from_project
    embrace_spm_log("removed package #{url}")
    changed = true
  end

  changed
end

def embrace_spm_app_dependency(installer)
  wanted = embrace_spm_enabled? ? embrace_spm_pod_dependencies(installer) : {}

  if embrace_spm_enabled? && wanted.empty?
    embrace_spm_log("EMBRACE_USE_SPM is set but no Embrace SPM products were found on the pods")
    return
  end

  installer.aggregate_targets.each do |aggregate_target|
    project = aggregate_target.user_project
    next if project.nil?

    app_targets = embrace_spm_app_targets(aggregate_target)
    next if app_targets.empty?

    changed = if wanted.empty?
      embrace_spm_remove(project, app_targets)
    else
      app_targets.map { |target| embrace_spm_add(project, target, wanted) }.any?
    end

    # Save only on a real change, so repeated installs don't churn the project file
    if changed
      project.save
      embrace_spm_log("updated #{File.basename(project.path)}")
    end
  end
end
