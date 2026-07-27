import {mockServerClient} from "mockserver-client";

// The local mockserver-node port and client, defined once. The server lifecycle lives in
// embrace_server.ts (started/stopped by wdio.conf.ts, or manually via invoke_embrace_server.ts);
// the payload source and the golden-capture CLI read/clear through this same client.
export const LOCAL_MOCK_PORT = 8877;

export const localMockClient = () => mockServerClient("localhost", LOCAL_MOCK_PORT);
