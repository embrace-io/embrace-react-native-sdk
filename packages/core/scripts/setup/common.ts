import Asker, {Answer} from "../util/asker";

interface IPackageJson {
  name: string;
  dependencies: Record<string, string>;
}

enum Platform {
  Android = "Android",
  IOS = "iOS",
}

const appIDQuestion = (platform: Platform) => ({
  name: `emb${platform}AppID`,
  message: `What is your ${platform} Embrace App ID? (5-character value)`,
});

const apiTokenQuestion = () => ({
  name: "embAPIToken",
  message: "What is your Embrace API token? (32-digit hex number)",
});

const iosFolderNameQuestion = () => ({
  name: "iosFolderName",
  message:
    "What is the name of the iOS project? Leave it empty if the project's name is the same as the name declared in 'package.json'",
});

const asker = new Asker();

const iosAppID = {
  name: "iOS App ID",
  fetch: async () => {
    const question = appIDQuestion(Platform.IOS);

    return asker
      .ask(question)
      .then((answers: Answer) => answers[question.name]);
  },
};

const androidAppID = {
  name: "Android App ID",
  fetch: async () => {
    const question = appIDQuestion(Platform.Android);

    return asker
      .ask(question)
      .then((answers: Answer) => answers[question.name]);
  },
};

const apiToken = {
  name: "API Token",
  fetch: async () => {
    const question = apiTokenQuestion();

    return asker
      .ask(question)
      .then((answers: Answer) => answers[question.name]);
  },
};

const iosProjectFolderName = {
  name: "iOS directory Name",
  fetch: async () => {
    const folderName = iosFolderNameQuestion();

    return asker
      .ask(folderName)
      .then((answers: Answer) => answers[folderName.name]);
  },
};

const packageJSON = {
  name: "App Name",
  fetch: () => {
    try {
      const packageJson = require("../../../../../../package.json");
      return Promise.resolve(packageJson);
    } catch {
      return Promise.reject(
        "Could not find package.json file. Try running this script from the root of the repo, where package.json is placed in a regular React Native app.",
      );
    }
  },
};

export {
  IPackageJson,
  Platform,
  iosAppID,
  androidAppID,
  apiToken,
  iosProjectFolderName,
  packageJSON,
};
