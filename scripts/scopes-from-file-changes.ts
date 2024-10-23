#!/usr/bin/env node
{
  /*
  Takes a list of file path changes like:

    ./scopes-from-file-changes.ts packages/core/something.txt packages/core/something-else.txt packages/spans/src/bar.txt

  And converts it to a list of scopes that can be used as flags to a lerna command

    --scope=@embrace-io/react-native-spans --scope=@embrace-io/react-native

  Example:

    yarn run foo $(./scopes-from-file-changes.ts packages/core/something.txt packages/spans/src/bar.txt)
   */

  const changedFiles = process.argv.slice(2);
  if (!changedFiles.length) {
    console.error("Expected at least one changed file");
    process.exit(1);
  }

  const scopes = new Set();

  changedFiles.forEach(f => {
    const pathElements = f.split("/");

    if (pathElements[0] !== "packages") {
      return;
    }

    const packageJSON = require(
      `./../${pathElements[0]}/${pathElements[1]}/package.json`,
    );

    scopes.add(`--scope=${packageJSON.name}`);
  });

  console.log([...scopes].join(" "));
}
