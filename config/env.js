const path = require("path");
const fs = require("fs");

const dotenvx = require("@dotenvx/dotenvx");

// Default path to the .env file (relative to this script)
let ENV_PATH = "../.env";

/**
 * Determines the environment type based on the config file path.
 */
const getEnv = configPath => {
  const envRegExp = /real|local|remote/i;

  const match = configPath.match(envRegExp);

  if (match && match.length) {
    const [matched] = match;
    return matched.toLowerCase();
  }

  return "";
};

/**
 * Loads an environment variable from the appropriate .env file.
 * - If the environment is "local", it loads from "../.env.local".
 * - Otherwise, it loads from "../.env".
 * - Uses dotenvx to parse the env file and overlays the values onto process.env.
 * - Returns the value of the requested variable, or an empty string if not found.
 */
const loadEnvVar = (varName, configFilePath) => {
  const environment = getEnv(configFilePath);

  let envPath = path.resolve(__dirname, ENV_PATH);
  // If local (or others), adjust the env file path to "../.env.xxx"
  if (environment !== "") {
    envPath += `.${environment}`;
  }

  // Check if the file exists and log a custom message if not
  if (!fs.existsSync(envPath)) {
    return console.warn(`env file "${envPath}" does not exist.`);
  }

  // Clone the current process.env to avoid side effects
  const processEnv = structuredClone(process.env);

  // Load environment variables from the selected env file, overriding process.env
  const dotenvxVars = dotenvx.config({
    path: envPath,
    overload: true,
    ignore: ["MISSING_ENV_FILE"],
  });

  // Restore the original process.env to avoid polluting the global state
  process.env = {...processEnv};

  // Merge loaded env vars with process.env, giving precedence to loaded vars
  const envVars = dotenvxVars.parsed
    ? {...process.env, ...dotenvxVars.parsed}
    : process.env;

  if (!envVars[varName]) {
    console.warn(`${varName} doesn't exist in ${ENV_PATH}`);
  }

  // returning the value or empty string for safety, already logged a warning if it doesn't exist for user reference
  return envVars[varName] || "";
};

module.exports = loadEnvVar;
