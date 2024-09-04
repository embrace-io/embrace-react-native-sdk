### Usage

From this directory (`packages/core/test-project`) install the required npm packages (`react-native`):

```bash
yarn install
```

## iOS

To make sure we are pulling the latest iOS SDK version:

```bash
cd ios
pod cache clean --all 
pod repo update --verbose
pod deintegrate ;
```

After install the npm packages, we should install pods:

```bash
pod install --repo-update --verbose
```

Once it's completed, open through `xcode` the `RNEmbraceTestProject.xcworkspace` and run the build. If everything succeeded and the build doesn't output any error, then it means the project is ready.

The goal here is to run the tests. From `xcode` go to `Product -> Test` or simple press `command + U` to start running the test suite.

> Simulator will be triggered but there is not such app there.

Notice that you can run this suite using Node. The script placed in `packages/core/package.json` uses environment variables. These can be exported in your favorite terminal:

```bash
export IOS_TEST_PLATFORM="iOS Simulator"
export IOS_TEST_DEVICE="iPhone 15 Pro"
export IOS_TEST_OS="17.5"
export IOS_TEST_SDK="iphonesimulator"
```

Load those new environment variables to make sure they are correctly in place:

```bash
// depending on your terminal
source ~./bashrc
```

And now from the `packages/core` directory:

```bash
// back to the root `packages/core` directory
cd ..
yarn run ios:test
```
