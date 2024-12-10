import {initialize as initEmbraceWithCustomExporters} from "@embrace-io/react-native-otlp";

const ENDPOINT = "https://otlp-gateway-prod-us-central-0.grafana.net/otlp/v1";
const TOKEN = "base64:instance:token";

const initWithCustomExporters = () =>
  initEmbraceWithCustomExporters({
    logExporter: {
      endpoint: `${ENDPOINT}/logs`,
      headers: [
        {
          key: "Authorization",
          token: `Basic ${TOKEN}`,
        },
      ],
      timeout: 30000,
    },
    traceExporter: {
      endpoint: `${ENDPOINT}/traces`,
      headers: [
        {
          key: "Authorization",
          token: `Basic ${TOKEN}`,
        },
      ],
      timeout: 30000,
    },
  });

export {initWithCustomExporters};
