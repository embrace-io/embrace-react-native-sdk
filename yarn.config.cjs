/**
 * The constraints defined in https://github.com/babel/babel/blob/main/yarn.config.cjs were used as a starting
 * point for this file, see also: https://yarnpkg.com/features/constraints
  */

/** @type {import('@yarnpkg/types')} */
const { defineConfig } = require('@yarnpkg/types');

/**
 *  Enforces consistent package metadata
  */
function enforcePackageInfo({ Yarn }) {
  for (const workspace of Yarn.workspaces()) {
    const info = {
      author: "Embrace <support@embrace.io> (https://embrace.io/)",
      bugs: {
        "url": "https://github.com/embrace-io/embrace-react-native-sdk/issues",
        "email": "support@embrace.io",
      },
      homepage: "https://github.com/embrace-io/embrace-react-native-sdk",
      license: "Apache-2.0",
      repository: {
        type: "git",
        url: "https://github.com/embrace-io/embrace-react-native-sdk",
        directory: workspace.cwd,
      },
      publishConfig: {
        access: "public",
      },
    };

    for (const key of Object.keys(info)) {
      if (workspace.manifest.private) {
        workspace.unset(key);
      } else {
        workspace.set(key, info[key]);
      }
    }

    if (workspace.manifest.private) {
      workspace.unset("keywords")
    } else {
      workspace.set("keywords", [...new Set([
        ...(workspace.keywords || []),
        "embrace",
        "react-native",
        "tracking",
        "observability",
        "instrumentation",
        "telemetry",
        "bug tracker",
      ])]);
    }
  }
}

/**
 *  Enforces that a dependency doesn't appear in both `dependencies` and `devDependencies`
  */
function enforceNoDualTypeDependencies({Yarn} ) {
  for (const dependency of Yarn.dependencies({ type: "devDependencies" })) {
    const otherDependency = Yarn.dependency({
      workspace: dependency.workspace,
      ident: dependency.ident,
      type: "dependencies",
    });
    if (otherDependency !== null) {
      dependency.delete();
    }
  }
}

/**
 * Enforces consistent file structure across workspaces
 */
function enforceFileStructure({ Yarn }) {
  for (const workspace of Yarn.workspaces()) {
    if (workspace.manifest.private) continue;

    workspace.set("main", "lib/index.js");
    workspace.set("typings", "lib/index.d.ts");
    workspace.set("directories", {
      lib: "lib",
      test: "__tests__"
    });
    workspace.set("files", [...new Set([
      ...(workspace.files || []),
      "lib"
    ])]);
    workspace.set("scripts", {
      ...(workspace.scripts || {}),
      build: "tsc",
    });
  }
}

/**
 *  Enforces that a workspace MUST depend on the same version of a dependency as the one used by the other workspaces
 *  Taken from: https://yarnpkg.com/features/constraints
 */
function enforceConsistentDependenciesAcrossTheProject({Yarn}) {
  for (const dependency of Yarn.dependencies()) {
    const isPeer = (dependency.type === "peerDependencies");

    for (const otherDependency of Yarn.dependencies({ident: dependency.ident})) {
      const isOtherPeer = (otherDependency.type === "peerDependencies");
      if (isPeer !== isOtherPeer) continue;

      dependency.update(otherDependency.range);
    }
  }
}

module.exports = defineConfig({
  constraints: async ctx => {
    enforcePackageInfo(ctx);
    enforceNoDualTypeDependencies(ctx);
    enforceFileStructure(ctx);
    enforceConsistentDependenciesAcrossTheProject(ctx);
  },
});