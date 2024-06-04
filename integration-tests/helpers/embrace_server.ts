import { start_mockserver, stop_mockserver } from 'mockserver-node';
import { EmbraceRequestBody, SessionPayload } from '../typings/embrace';

import { mockServerClient } from 'mockserver-client';

const PORT = 8877;

const startServer = (trace: boolean) => {
  start_mockserver({
    serverPort: PORT,
    trace,
  });
};

const stopServer = () => {
  stop_mockserver({
    serverPort: PORT,
  });
};

const clearServer = async () => {
  return await mockServerClient('localhost', PORT).clear({}, 'LOG');
};

const getSessionPayloads = async (delay = 2000): Promise<SessionPayload[]> => {
  if (delay) {
    await new Promise((r) => setTimeout(r, delay));
  }

  const requests = await mockServerClient(
    'localhost',
    PORT
  ).retrieveRecordedRequests({
    path: '/v1/log/sessions',
    method: 'POST',
  });

  return requests.map((r) => {
    const body = r.body as EmbraceRequestBody;
    return body.json.s;
  });
};

export { startServer, stopServer, clearServer, getSessionPayloads };
