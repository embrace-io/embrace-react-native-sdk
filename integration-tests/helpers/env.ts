interface Env {
  PORT: number;
  RUNNER: "local" | "browser";
  RAW_EMB_URL: string;
  SERVICE_NAME: string;
}

interface EnvVarConfig {
  type: "string" | "number" | "boolean";
  required: boolean;
  finalKey?: string;
}

const REQUIRED_ENV: {
  [key in keyof Env]: EnvVarConfig;
} = {
  RAW_EMB_URL: {type: "string", required: true},
  SERVICE_NAME: {type: "string", required: true},
  PORT: {type: "number", required: true},
  RUNNER: {type: "string", required: true},
};

const getEnv = (): Env => {
  const envToReturn: Env = {} as Env;

  if (process.env.RUNNER !== "local" && process.env.RUNNER !== "browser") {
    throw new Error("Invalid RUNNER value");
  }
  validateAndAddEnv(REQUIRED_ENV, envToReturn);

  return envToReturn;
};

const validateAndAddEnv = (ENVS: {}, envToReturn: Env) => {
  Object.entries(ENVS).forEach(([key, value]) => {
    const envVar = process.env[key];
    const {type, required} = value as EnvVarConfig;

    if (required && !envVar) {
      throw new Error(`Environment ${key} is missing`);
    }
    if (envVar) {
      switch (type) {
        case "string":
          envToReturn[key] = envVar;
          break;
        case "number":
          const valueParsed = parseInt(envVar, 10);
          if (isNaN(valueParsed)) {
            throw new Error(`Invalid ${key} value, it is not a number`);
          }
          envToReturn[key] = valueParsed;
          break;
        case "boolean":
          if (envVar !== "true" && envVar !== "false") {
            throw new Error(`Invalid ${key} value, it is not a boolean`);
          }
          envToReturn[key] = envVar === "true";
          break;
      }
    }
  });
};

const {PORT, RUNNER, RAW_EMB_URL, SERVICE_NAME} = getEnv();
export {PORT, RUNNER, RAW_EMB_URL, SERVICE_NAME};
