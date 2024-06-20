import axios from 'axios';
import {BASE_URL, API_VERSION} from './config';
import {applyNetworkInterceptors} from '@embrace-io/react-native';

applyNetworkInterceptors(axios).then(r => {
  console.log('FUNC', r);
});

export const getPokemonWithFetch = async () =>
  await fetch(`${BASE_URL}${API_VERSION}pokemon/ditto`, {
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: -1,
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
      params: {hola: 'hola'},
    })
    .then(function (response) {
      console.log(`${BASE_URL}${API_VERSION}pokemon/MEW RESPONSE`);

      return response.data;
    })
    .catch(function (error) {
      console.log(`${BASE_URL}${API_VERSION}pokemon/MEW ERROR`, error);
    });
