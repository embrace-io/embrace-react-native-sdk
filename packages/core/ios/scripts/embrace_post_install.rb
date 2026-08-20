require "json"

# Declares the Embrace iOS SDK's SPM package on the app target.
#
# RN's spm_dependency helper attaches SPM products to the *pod* target. Xcode's embed-and-sign
# step belongs to the target that declares a package product, and CocoaPods' "Embed Pods
# Frameworks" script only knows about pods, so products declared that way never reach the app
# bundle: Debug survives on an absolute rpath into DerivedData, Release crashes at launch with
# `Library not loaded: @rpath/...PackageProduct.framework`. Declaring EmbraceIO on the app target
# restores the embed phase, code signing and the normal @executable_path layout; Xcode embeds the
# rest of the package's dynamic frameworks along with it.
#
# Usage, from a Podfile's post_install:
#
#   require Pod::Executable.execute_command('node', ['-p',
#     'require.resolve(
#       "@embrace-io/react-native/ios/scripts/embrace_post_install.rb",
#       {paths: [process.argv[1]]},
#     )', __dir__]).strip
#
#   post_install do |installer|
#     embrace_post_install(installer)
#   end
#
# Call it unconditionally: with EMBRACE_USE_SPM unset it removes what an earlier run added.

EMBRACE_SPM_URL = "https://github.com/embrace-io/embrace-apple-sdk.git".freeze
EMBRACE_SPM_PRODUCT = "EmbraceIO".freeze

def embrace_spm_log(msg)
  Pod::UI.puts "[Embrace/SPM] #{msg}"
end

def embrace_spm_enabled?
  ENV["EMBRACE_USE_SPM"] == "1"
end

# Pinned in the same package.json the podspec reads, so the app and the pod can't disagree
def embrace_spm_version
  path = File.expand_path("../../package.json", __dir__)

  version = begin
    JSON.parse(File.read(path)).dig("embrace", "iosVersion")
  rescue Errno::ENOENT, JSON::ParserError => e
    raise "[Embrace/SPM] couldn't read the Embrace iOS SDK version from #{path}: #{e.message}"
  end

  raise "[Embrace/SPM] no embrace.iosVersion in #{path}" if version.to_s.empty?

  version
end

def embrace_spm_requirement
  {kind: "exactVersion", version: embrace_spm_version}
end

def embrace_spm_package?(package)
  package.is_a?(Xcodeproj::Project::Object::XCRemoteSwiftPackageReference) &&
    package.repositoryURL.to_s == EMBRACE_SPM_URL
end

# A requirement read back from a project file has string keys; ours has symbols
def embrace_spm_pinned_version(package)
  requirement = package.requirement || {}
  requirement["version"] || requirement[:version]
end

def embrace_spm_app_targets(aggregate_target)
  aggregate_target.user_targets.select { |target| target.symbol_type == :application }
end

# Returns true when the project was changed
def embrace_spm_add(project, target)
  changed = false
  package = project.root_object.package_references.find { |candidate| embrace_spm_package?(candidate) }

  unless package
    package = project.new(Xcodeproj::Project::Object::XCRemoteSwiftPackageReference)
    package.repositoryURL = EMBRACE_SPM_URL
    package.requirement = embrace_spm_requirement
    project.root_object.package_references << package
    embrace_spm_log("added #{EMBRACE_SPM_URL} #{embrace_spm_version}")
    changed = true
  end

  # Follow the pin when the RN SDK is upgraded to a new iOS SDK version
  pinned = embrace_spm_pinned_version(package)
  if pinned != embrace_spm_version
    package.requirement = embrace_spm_requirement
    embrace_spm_log("updated #{EMBRACE_SPM_PRODUCT} to #{embrace_spm_version} (was #{pinned || "unpinned"})")
    changed = true
  end

  already_linked = target.package_product_dependencies.any? do |dep|
    dep.package == package && dep.product_name == EMBRACE_SPM_PRODUCT
  end

  unless already_linked
    dep = project.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
    dep.package = package
    dep.product_name = EMBRACE_SPM_PRODUCT
    target.package_product_dependencies << dep
    embrace_spm_log("added #{EMBRACE_SPM_PRODUCT} to #{target.name}")
    changed = true
  end

  changed
end

# Drops what we added, so switching back to the CocoaPods pod can't leave the app linking Embrace
# twice. Returns true when the project was changed.
def embrace_spm_remove(project, targets)
  changed = false

  targets.each do |target|
    target.package_product_dependencies.dup.each do |dep|
      next unless embrace_spm_package?(dep.package)

      target.package_product_dependencies.delete(dep)
      embrace_spm_log("removed #{dep.product_name} from #{target.name}")
      changed = true
    end
  end

  project.root_object.package_references.dup.each do |package|
    next unless embrace_spm_package?(package)

    still_used = project.targets.any? do |target|
      target.respond_to?(:package_product_dependencies) &&
        target.package_product_dependencies.any? { |dep| dep.package == package }
    end
    next if still_used

    project.root_object.package_references.delete(package)
    # Delete the object too — a reference left orphaned in the file still takes part in package
    # resolution and can collide with another package providing the same products
    package.remove_from_project
    embrace_spm_log("removed #{EMBRACE_SPM_URL}")
    changed = true
  end

  changed
end

def embrace_post_install(installer)
  installer.aggregate_targets.each do |aggregate_target|
    project = aggregate_target.user_project
    next if project.nil?

    app_targets = embrace_spm_app_targets(aggregate_target)
    next if app_targets.empty?

    changed = if embrace_spm_enabled?
      app_targets.map { |target| embrace_spm_add(project, target) }.any?
    else
      embrace_spm_remove(project, app_targets)
    end

    # Save only on a real change, so repeated installs don't churn the project file
    if changed
      project.save
      embrace_spm_log("updated #{File.basename(project.path)}")
    end
  end
end
