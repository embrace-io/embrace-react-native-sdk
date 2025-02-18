const dotenvx = require("@dotenvx/dotenvx");

let ENV_PATH = "../.env";

const getEnv = configPath => {
  const envRegExp = /real|production/i;

  if (envRegExp.test(configPath)) {
    return "";
  }

  return "local";
};

const loadEnvVar = (varName, configFilePath) => {
  const environment = getEnv(configFilePath);

  if (environment) {
    ENV_PATH += `.${environment}`;
  }

  const processEnv = structuredClone(process.env);
  const dotenvxVars = dotenvx.config({path: ENV_PATH, overload: true});

  process.env = {...processEnv};

  const envVars = dotenvxVars.parsed
    ? {...process.env, ...dotenvxVars.parsed}
    : process.env;

  return envVars[varName] || "";
};

module.exports = loadEnvVar;
