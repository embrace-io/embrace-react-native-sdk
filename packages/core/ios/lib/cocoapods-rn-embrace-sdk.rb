require 'cocoapods'

module RNEmbraceIOKSCrashHeadersPatch
  def self.run(installer)
    pod_names = installer.pod_targets.map(&:name)
    embrace_pods = %w[RNEmbraceCore EmbraceIO]

    unless pod_names.any? { |n| n =~ /\AKSCrash/ }
      Pod::UI.puts "[EmbraceIO] Skipped: KSCrash not present".yellow
      return
    end
    unless (pod_names & embrace_pods).any?
      Pod::UI.puts "[EmbraceIO] Skipped: Embrace pods not present".yellow
      return
    end

    ks_demangle = '$(PODS_ROOT)/KSCrash/Sources/KSCrashDemangleFilter'
    patched = false

    installer.pods_project.targets.each do |t|
      next unless t.name =~ /\AKSCrash/
      t.build_configurations.each do |config|
        paths = Array(config.build_settings['HEADER_SEARCH_PATHS'])
        paths = ['$(inherited)'] if paths.empty?
        unless paths.include?(ks_demangle)
          config.build_settings['HEADER_SEARCH_PATHS'] = ([ks_demangle] + paths).uniq
          patched = true
        end
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] ||= 'gnu++17'
      end
    end

    installer.pods_project.save if patched
    if patched
      Pod::UI.puts "[EmbraceIO] Applied KSCrash Demangle header path fix".green
    else
      Pod::UI.puts "[EmbraceIO] KSCrash already patched (no changes)".green
    end
  rescue => e
    Pod::UI.puts "[EmbraceIO] Error applying KSCrash fix: #{e.message}".red
    Pod::UI.puts e.backtrace.join("\n").red if Pod::Config.instance.verbose?
  end
end
