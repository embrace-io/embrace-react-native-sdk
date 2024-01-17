import React, {useEffect} from 'react';
import {SafeAreaView, Text, TouchableOpacity} from 'react-native';

import {initialize, endAppStartup} from '@embrace-io/react-native';

import MainNavigation from './src/navigation/MainNavigation';
import EmbraceApolloLink from '@embrace-io/apollo-graphql/lib/index';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  useMutation,
} from '@apollo/client';
import {gql} from '@apollo/client';
import {useQuery} from '@apollo/client';
import {BatchHttpLink} from 'apollo-link-batch-http';

export const USERS_MUTATION = gql`
  mutation idk {
    updateTodo(
      input: {id: "8db57b8f-be09-4e07-a1f6-4fb77d9b16e7", done: true}
    ) {
      id
      done
    }
  }
`;

export const USERS_QUERY = gql`
  query getItems {
    users {
      id
      email
      name
    }
  }
`;

export const POKE_QUERY = gql`
  query getItems {
    pokemon_v2_item {
      name
      cost
    }
  }
`;

const App = () => {
  useEffect(() => {
    initialize();
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

const ApolloWrappedComponent = ({children}) => {
  useQuery(USERS_QUERY);
  const [responsee] = useMutation(USERS_MUTATION);
  responsee().then(rr => {
    console.log('responsee', rr);
  });

  const httpLink = new BatchHttpLink({
    uri: 'https://api.mocki.io/v2/c4d7a195/graphql',
  });
  const embraceMiddleware = new EmbraceApolloLink.build(ApolloLink, httpLink);
  const client = new ApolloClient({
    link: embraceMiddleware(),

    cache: new InMemoryCache(),
  });
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
export default App;
