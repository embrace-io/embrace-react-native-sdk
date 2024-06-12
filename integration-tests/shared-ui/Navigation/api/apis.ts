import axios from "axios";
import { BASE_URL, API_VERSION } from "./config";
import { applyNetworkInterceptors } from "@embrace-io/react-native";
import { IAxios } from "@embrace-io/react-native/lib/src/interfaces/IAxios";

applyNetworkInterceptors(axios as IAxios).then((r) => {
  console.log("FUNC", r);
});

export const getPokemonWithFetch = async () =>
  await fetch(`${BASE_URL}${API_VERSION}pokemon/ditto`, {
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  })
    .then(function (response) {
      console.log(`${BASE_URL}${API_VERSION}pokemon/ditto RESPONSE`);
      return response.json();
    })
    .catch(function (error) {
      console.log(`${BASE_URL}${API_VERSION}pokemon/ditto ERROR`, error);
    });

export const getPokemonWithAxios = async () =>
  axios
    .get(`${BASE_URL}${API_VERSION}pokemon/mew}`, {
      params: { hola: "hola" },
    })
    .then(function (response) {
      console.log(`${BASE_URL}${API_VERSION}pokemon/MEW RESPONSE`);

      return response.data;
    })
    .catch(function (error) {
      console.log(`${BASE_URL}${API_VERSION}pokemon/MEW ERROR`, error);
    });
