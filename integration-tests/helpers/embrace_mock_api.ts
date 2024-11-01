import {ParsedLogPayload, ParsedSpanPayload} from "../typings/embrace";
import axios from "axios";
import {parseSpanPayload} from "./span";
import {parseLogPayload} from "./log";

const EMB_URL = "https://mock-api.emb-eng.com/namespace/SgNw5/stored";

const getSpanPayloads = async (delay = 5000): Promise<ParsedSpanPayload[]> => {
  if (delay) {
    console.log(`waiting ${delay}ms before checking for span payloads`);
    await new Promise(r => setTimeout(r, delay));
  }
  const response = await axios.get(EMB_URL);
  const {Spans} = response.data;
  return Spans.map(r => {
    return parseSpanPayload(JSON.parse(r.Body).data);
  });
};

const getLogPayloads = async (delay = 5000): Promise<ParsedLogPayload[]> => {
  if (delay) {
    console.log(`waiting ${delay}ms before checking for log payloads`);
    await new Promise(r => setTimeout(r, delay));
  }
  const response = await axios.get(EMB_URL);
  const {Logs} = response.data;

  return Logs.map(r => {
    return parseLogPayload(JSON.parse(r.Body));
  });
};

const clearApiData = async () => {
  return await axios.delete(EMB_URL);
};

export {getSpanPayloads, getLogPayloads, clearApiData};
