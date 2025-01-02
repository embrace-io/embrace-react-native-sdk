import * as React from "react";
import {View, Text, Button, FlatList} from "react-native";
import {styles} from "../helpers/styles";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import {gql, useLazyQuery, ApolloLink} from "@apollo/client";
import EmbraceApolloLink from "@embrace-io/react-native-apollo-graphql";

const BOOKS_QUERY = gql`
  query GetBooks {
    books {
      author
      title
    }
  }
`;

// @ts-ignore
const embraceCreateHttpLink = new EmbraceApolloLink.build(ApolloLink, HttpLink);
const client = new ApolloClient({
  // using `@embrace-io/apollo-graphql` following our README.md
  // NOTE: this fails, POC in progress
  link: embraceCreateHttpLink({
    uri: "http://localhost:4000/graphql",
    headers: {"x-emb-path": "/graphql/test"},
  }),
  cache: new InMemoryCache(),
});

const ApolloGraphQLScreen = () => {
  return (
    <ApolloProvider client={client}>
      <Books />
    </ApolloProvider>
  );
};

const Books = () => {
  const [getBooks, {data: booksData, loading: isLoading}] =
    useLazyQuery(BOOKS_QUERY);

  const handleGetBooks = React.useCallback(async () => {
    await getBooks();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Apollo GraphQL</Text>
        <Button onPress={handleGetBooks} title="Get Books" />
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            data={booksData?.books}
            keyExtractor={item => item.author}
            renderItem={({item}) => (
              <Text>
                {item.title} - {item.author}
              </Text>
            )}
          />
        )}
      </View>
    </View>
  );
};

export {ApolloGraphQLScreen};
