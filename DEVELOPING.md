# Developing

## Setup

```bash
corepack enable
yarn install
brew install cocoapods
```

Notice that if you are using a different yarn version globally you could apply the required version (yarn@4.3.1 as mentioned in ./package.json through `packageManager`) just local to this project by running

```bash
corepack enable
corepack prepare yarn@4.3.1 --activate
corepack yarn install
```

## Adding a new package

Any new package under ./packages/ will get automatically picked up as a new Yarn workspace. The directory should include:
- `package.json` with name, description, main, typings (other fields will be filled by yarn constraints, version is supplied by Lerna)
- `tsconfig.json` that extends from the one at the root
- `README.md`
- `src/` and `__tests__/` folders to contain the code for the package.

If an item from the previous list is missing, the package won't compile.

## Adding dependencies

Since we are using Yarn workspaces `dependencies` should not be added to the root `package.json` (see [more details](https://stackoverflow.com/a/53558779)).
If multiple packages include the same dependency Yarn constraints will enforce that the version used matches.
`devDependencies` are fine to add at the root `package.json` (see [more details](https://github.com/lerna/lerna/issues/1079#issuecomment-337660289))
if they are only needed at the top-level, otherwise add them to just the individual package that requires it. If they
are shared between multiple packages then they should be added to the Yarn constraints file to enforce a common version.
This is also where we define common peerDependencies and enforce a common version. These are packages such as React Native
that our packages require but that we leave to the customer to have defined as explicit dependencies.

## Adding new Native Modules

For adding new Native Modules please refer to our [Native Developing docs](./NATIVE_MODULE_DEVELOPING.md)

## Testing changes during development

From the root of the project you can lint and test all packages with:

```bash
yarn lint:js # or lint:swift for native changes
yarn test # or android:test or ios:test for native changes
```

## Integration testing

See the [integration testing README](./integration-tests/README.md) for more details.

## Updating native SDK dependencies

1. Bump the Android (SDK + Swazzler)/iOS dependencies to the latest available stable versions in `./yarn.config.cjs`
2. Run `yarn constraints --fix` to propagate this change to all package.json files
3. Run `yarn build` to update build files to the latest versions
4. Run `yarn ios:install` to update the iOS test projects

## Branching strategy

Generally all proposed changes should target the `main` branch and new releases are cut from there. For urgent patch
fixes, use the `custom` bump type in the Prepare Release workflow (see below) and specify the patch version explicitly.

## Releasing

Releases are fully automated via two GitHub Actions workflows.

### Step 1 — Prepare the release

1. Go to [Actions → Prepare Release](https://github.com/embrace-io/embrace-react-native-sdk/actions/workflows/prepare-release.yml) and click **Run workflow**
2. Choose a bump type: `patch`, `minor`, `major`, or `custom` (custom lets you specify any valid semver, e.g. `6.7.0-beta.1`)
3. The workflow will bump versions, push a `release/vX.Y.Z` branch, and open a PR into `main` labeled `release`
4. Verify that CI passes on the release PR, including integration tests on [BrowserStack](https://app-automate.browserstack.com/dashboard/v2/builds)

### Step 2 — Publish

5. Merge the release PR — the [Release workflow](https://github.com/embrace-io/embrace-react-native-sdk/actions/workflows/release.yml) triggers automatically on merge
6. The workflow builds, publishes all packages to npm with provenance, pushes the `vX.Y.Z` git tag, and creates a GitHub release
7. Verify at https://www.npmjs.com/org/embrace-io that the new versions are published
8. Update and publish the [Changelog](https://github.com/embrace-io/embrace-docs/blob/main/docs/react-native/changelog.md) for the release

NOTE: If you make a mistake while publishing you can remove the specific version w/ `npm unpublish <package-name>@<version>`, see [Unpublishing a single version of a package](https://docs.npmjs.com/unpublishing-packages-from-the-registry#unpublishing-a-single-version-of-a-package)

## Deprecating

If we find a critical issue in particular version that requires a hotfix we should mark that version as deprecated. This
can be done using the following:

```bash
npm deprecate @embrace-io/<package>@"<version>" "some message explaining deprecation"
```

The command will prompt you to login and/or supply 2FA for NPM. You will need to re-run it for each package.

Next commit an update to the [Changelog](https://github.com/embrace-io/embrace-docs/blob/main/docs/react-native/changelog.md)
that notifies about the deprecation like:

```markdown
## <bad version>
*<date>*

:::warning Important
This version contained an issue where .... Please use <fixed-version> instead.
:::
```

If you make a mistake you can undeprecate a package following [these steps](https://www.notion.so/embraceio/Mark-older-releases-as-deprecated-in-the-npmjs-registry-10d7e3c9985280cb9ea5ea1e9f054c83?pvs=4).

## Troubleshooting

### Local iOS development issues

Try closing any open simulators and clearing all derived data:

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```

If the issue is related to pods try forcing a clean install with:

```bash
  cd <app>/ios
  rm Podfile.lock
  pod cache clean --all
  pod repo update --verbose
  pod deintegrate
  pod install --repo-update --verbose
```

### Local Android development issues

Try stopping and cleaning local services (in case there are unknown issues related to the start of the app):

```bash
  cd <app>/android
  ./gradlew --stop  // stop daemons
  rm -rf ~/.gradle/caches/
  rm -rf .gradle/
  rm -rf ~/.gradle/daemon/
  rm -rf ~/.gradle/native/
  rm -rf app/build/
  ./gradlew build --stacktrace
```

### Local JS development issues

Try removing any `node_modules/` in the directory hierarchy and re-run `yarn install` from the root
