import {start_mockserver, stop_mockserver} from "mockserver-node";
import {LOCAL_MOCK_PORT, localMockClient} from "./local_mock";

const startServer = async (trace: boolean) => {
  start_mockserver({
    serverPort: LOCAL_MOCK_PORT,
    trace,
  });

  // Give the mock server a few seconds to spin up
  await new Promise(r => setTimeout(r, 5000));

  try {
    await localMockClient().mockAnyResponse({
      httpResponse: {
        body: "{}",
        statusCode: 200,
        headers: [
          {name: "Access-Control-Allow-Origin", values: ["*"]},
          {name: "Access-Control-Allow-Methods", values: ["POST"]},
          {name: "Access-Control-Allow-Headers", values: ["*"]},
          {name: "Access-Control-Max-Age", values: ["1728000"]},
        ],
      },
      times: {
        unlimited: true,
      },
    });
    console.log("setup mock response");
  } catch (error) {
    console.log(error);
  }
};

const stopServer = () => {
  stop_mockserver({
    serverPort: LOCAL_MOCK_PORT,
  });
};

export {startServer, stopServer};
