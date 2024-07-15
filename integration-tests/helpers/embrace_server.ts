import {start_mockserver, stop_mockserver} from "mockserver-node";
import {EmbracePayload, ParsedSpanPayload} from "../typings/embrace";
import {parseSpanPayload} from "./span";

import {mockServerClient} from "mockserver-client";

const PORT = 8877;

const startServer = async (trace: boolean) => {
  start_mockserver({
    serverPort: PORT,
    trace,
  });

  // Give the mock server a few seconds to spin up
  await new Promise(r => setTimeout(r, 5000));

  try {
    const client =  mockServerClient("localhost", PORT);
    await client.mockAnyResponse({
      httpResponse: {
        "body": "{}",
        "statusCode": 200,
      },
      times: {
        unlimited: true,
      }
    })
    console.log("setup mock response");
  } catch (error) {
    console.log(error);
  }

  return await new Promise(() => {});
};

const stopServer = () => {
  stop_mockserver({
    serverPort: PORT,
  });
};

const clearServer = async () => {
  return await mockServerClient("localhost", PORT).clear({}, "LOG");
};

const getSpanPayloads = async (delay = 5000): Promise<ParsedSpanPayload[]> => {
  if (delay) {
    console.log(`waiting ${delay}ms before checking for span payloads`)
    await new Promise(r => setTimeout(r, delay));
  }

  const requests = await mockServerClient(
    "localhost",
    PORT,
  ).retrieveRecordedRequests({
    path: "/v2/spans",
    method: "POST",
  });

  return requests.map(r => {
    const body = r.body as EmbracePayload;
    return parseSpanPayload(body.json.data);
  });
}

export {startServer, stopServer, clearServer, getSpanPayloads};
