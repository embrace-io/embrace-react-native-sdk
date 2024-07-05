import Asker, {Answer} from "../util/asker";

export interface IPackageJson {
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
const asker = new Asker();

export const iosAppID = {
  name: "iOS App ID",
  fetch: () => {
    const question = appIDQuestion(Platform.IOS);
    return asker
      .ask(question)
      .then((answers: Answer) => answers[question.name]);
  },
};

export const androidAppID = {
  name: "Android App ID",
  fetch: () => {
    const question = appIDQuestion(Platform.Android);
    return asker
      .ask(question)
      .then((answers: Answer) => answers[question.name]);
  },
};

export const apiToken = {
  name: "API Token",
  fetch: () => {
    const question = apiTokenQuestion();
    return asker
      .ask(question)
      .then((answers: Answer) => answers[question.name]);
  },
};

export const packageJSON = {
  name: "app name",
  fetch: () => {
    try {
      const packageJson = require("../../../../../../package.json");
      return Promise.resolve(packageJson);
    } catch {
      return Promise.reject("could not find package.json file");
    }
  },
};
