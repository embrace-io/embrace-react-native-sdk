# Developing

## Setup

```bash
corepack enable
yarn install
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

Generally all proposed changes should target the `main` branch and new releases are cut from there after QA. One exception
is urgent patch fixes, in those cases a branch should be made from the latest released tag to isolate the fix from any
unreleased changes on `main` and a patch release will be cut from that new branch.

## Releasing

1. Create a `release/` branch off of main with an empty commit: `git commit --allow-empty -m "starting the release process for vX.X.X"`.
    Push it to origin and create a PR from it to kick-off the integration test workflow
2. Verify that the integration test runs on [BrowserStack](https://app-automate.browserstack.com/dashboard/v2/builds) succeed for the release branch
3. Make sure you are logged into the npmjs registry (`npm login`)
4. Release to npm with `yarn publish-modules`, you will be prompted to choose the version number to update to
5. Check https://www.npmjs.com/org/embrace-io, the latest versions should have been published
6. Check https://github.com/embrace-io/embrace-react-native-sdk/tags, a vX.X.X tag should have been pushed
7. The release branch PR should now include all the version updates, merge it back to `main`
8. Use `integration-tests/update-embrace-package.sh <testApp> --version=<version>` to point a test app to the latest released packages to confirm basic behaviour
9. Update and publish the [Changelog](https://github.com/embrace-io/embrace-docs/blob/main/docs/react-native/changelog.md) for the release

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
  rm -rf app/build/
  ./gradlew build --stacktrace
```

### Local JS development issues

Try removing any `node_modules/` in the directory hierarchy and re-run `yarn install` from the root
