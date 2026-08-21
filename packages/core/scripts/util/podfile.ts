// Snippets and helpers for patching Podfiles, shared by the bare-RN setup wizard
// and the Expo config plugin.

// Never added anymore, KSCrash sets DEFINES_MODULE itself as of 2.5.0. Kept in
// EMBRACE_BLOCKS so re-running the wizard or a prebuild strips it from older projects.
const LEGACY_KSCRASH_BLOCK =
  "# [Embrace] Make KSCrash modular so Swift can import it \npod 'KSCrash', :modular_headers => true\n\n";

const POST_INSTALL_REQUIRE_BLOCK = `# Resolve the Embrace post_install helper with node to allow for hoisting
require Pod::Executable.execute_command('node', ['-p',
  'require.resolve(
    "@embrace-io/react-native/ios/scripts/embrace_post_install.rb",
    {paths: [process.argv[1]]},
  )', __dir__]).strip

`;

const POST_INSTALL_BLOCK = `
    # Adds/removes the app target's Embrace SPM dependencies based on the EMBRACE_USE_SPM flag
    embrace_post_install(installer)
`;

const EMBRACE_BLOCKS = [
  POST_INSTALL_REQUIRE_BLOCK,
  POST_INSTALL_BLOCK,
  LEGACY_KSCRASH_BLOCK,
];

const PLATFORM_ANCHOR = "platform :ios";
const POST_INSTALL_ANCHOR = "post_install do |installer|";

type PodfilePatch = {contents: string; error?: string};

const removeEmbracePatches = (contents: string): string =>
  EMBRACE_BLOCKS.reduce((acc, block) => acc.replace(block, ""), contents);

const applyEmbracePatches = (original: string): PodfilePatch => {
  const missing: string[] = [];

  if (!original.includes(PLATFORM_ANCHOR)) {
    missing.push(PLATFORM_ANCHOR);
  }

  if (!original.includes(POST_INSTALL_ANCHOR)) {
    missing.push(POST_INSTALL_ANCHOR);
  }

  if (missing.length) {
    return {
      contents: original,
      error: `Could not patch the Podfile, could not find: ${missing
        .map(anchor => `\`${anchor}\``)
        .join(", ")}`,
    };
  }

  let contents = removeEmbracePatches(original);

  contents = contents.replace(
    PLATFORM_ANCHOR,
    () => POST_INSTALL_REQUIRE_BLOCK + PLATFORM_ANCHOR,
  );
  contents = contents.replace(
    POST_INSTALL_ANCHOR,
    () => POST_INSTALL_ANCHOR + POST_INSTALL_BLOCK,
  );

  return {contents};
};

export {EMBRACE_BLOCKS, applyEmbracePatches};
