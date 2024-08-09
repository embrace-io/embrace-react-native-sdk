## Usage

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

NOTE: Simulator will be triggered but there is not such app there.