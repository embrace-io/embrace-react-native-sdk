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
        ...(workspace.manifest.keywords || []),
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
 *  Enforces each package having a peerDependency on React Native
 */
function enforceReactNativePeerDependency({ Yarn }) {
  for (const dependency of Yarn.dependencies({ident: 'react-native'})) {
    if (dependency.type === "peerDependencies") {
      dependency.update(">=0.56.0");
    }
  }
}

/**
 *  Enforces each package having a common typescript version
 */
function enforceCommonTypescript({ Yarn }) {
  for (const dependency of Yarn.dependencies({ident: 'typescript'})) {
    dependency.update("^5.6.3");
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
    enforceConsistentDependenciesAcrossTheProject(ctx);
    enforceReactNativePeerDependency(ctx);
    enforceCommonTypescript(ctx);
  },
});
