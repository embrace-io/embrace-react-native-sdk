import React, {useEffect} from 'react';
import {Alert, SafeAreaView, Text, TouchableOpacity} from 'react-native';
// import codePush from 'react-native-code-push';

import {
  initialize,
  endAppStartup,
  setJavaScriptBundlePath,
} from '@embrace-io/react-native';

import MainNavigation from './src/navigation/MainNavigation';
// import EmbraceApolloLink from '@react-native-embrace/apollo-graphql/lib/index';
// import {
//   ApolloClient,
//   InMemoryCache,
//   ApolloProvider,
//   ApolloLink,
//   useMutation,
// } from '@apollo/client';
// import {gql} from '@apollo/client';
// import {useQuery} from '@apollo/client';
// import {BatchHttpLink} from 'apollo-link-batch-http';

// export const USERS_MUTATION = gql`
//   mutation idk {
//     updateTodo(
//       input: {id: "8db57b8f-be09-4e07-a1f6-4fb77d9b16e7", done: true}
//     ) {
//       id
//       done
//     }
//   }
// `;

// export const USERS_QUERY = gql`
//   query getItems {
//     users {
//       id
//       email
//       name
//     }
//   }
// `;

// export const POKE_QUERY = gql`
//   query getItems {
//     pokemon_v2_item {
//       name
//       cost
//     }
//   }
// `;

let App = () => {
  // const checkCodePush = async () => {
  //   const state = await codePush.sync(undefined, e => console.log('asd', e));
  //   if (
  //     state !== codePush.SyncStatus.UP_TO_DATE ||
  //     state !== codePush.SyncStatus.UPDATE_IGNORED ||
  //     state !== codePush.SyncStatus.UPDATE_INSTALLED ||
  //     state !== codePush.SyncStatus.UNKNOWN_ERROR
  //   ) {
  //     console.log('ENTRO', state === codePush.SyncStatus.SYNC_IN_PROGRESS);
  //     // setTimeout(checkCodePush, 1000);
  //   } else if (state === codePush.SyncStatus.UPDATE_INSTALLED) {
  //     Alert.alert(
  //       'CODEPUSrH e',
  //       `${e} ${codePush.SyncStatus.UPDATE_INSTALLED === e}`,
  //     );
  //   } else if (state === codePush.SyncStatus.UP_TO_DATE) {
  //     Alert.alert(
  //       'CODEPUSrH UP_TO_DATE',
  //       `${e} ${codePush.SyncStatus.UPDATE_INSTALLED === e}`,
  //     );
  //   }
  // };
  useEffect(() => {
    // codePush.getUpdateMetadata().then(a => {
    //   console.log('ASD', a);
    // });
    // checkCodePush();

    // setTimeout(() => {
    //   codePush.sync(undefined, myCallback);
    // }, 10000);
    initialize({patch: '1.2.3'}).then(async () => {
      setTimeout(async () => {
        // var inicio = performance.now();
        // // const d = await setJavaScriptBundlePath(
        // //   '/Users/mutsi/job/embrace/react-native-embrace/examples/react-native-test-suite/bundlecito.jsbundle',
        // // );
        // console.log('R', d);
        // var fin = performance.now();
        // Calcular la diferencia en milisegundos
        // var tiempoTranscurrido = fin - inicio;
        // console.log('Va a record', tiempoTranscurrido);
        // Alert.alert('Tiempo', tiempoTranscurrido.toString());
      }, 10000);
    });
    endAppStartup();
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <TouchableOpacity
        style={{
          backgroundColor: 'rgba(44, 62, 80, 1)',
          height: 100,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => {
          setTimeout(() => {}, 3000);
        }}>
        <Text
          style={{
            color: 'white',
            fontSize: 30,
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
          Embrace Testing Suite
        </Text>
      </TouchableOpacity>
      <MainNavigation />
    </SafeAreaView>
  );
};

// const ApolloWrappedComponent = ({children}) => {
//   useQuery(USERS_QUERY);
//   const [responsee] = useMutation(USERS_MUTATION);
//   responsee().then(rr => {
//     console.log('responsee', rr);
//   });

//   const httpLink = new BatchHttpLink({
//     uri: 'https://api.mocki.io/v2/c4d7a195/graphql',
//   });
//   const embraceMiddleware = new EmbraceApolloLink.build(ApolloLink, httpLink);
//   const client = new ApolloClient({
//     link: embraceMiddleware(),

//     cache: new InMemoryCache(),
//   });
//   return <ApolloProvider client={client}>{children}</ApolloProvider>;
// };
// let codePushOptions = {checkFrequency: codePush.CheckFrequency.ON_APP_RESUME};

// App = codePush(codePushOptions)(App);

export default App;
