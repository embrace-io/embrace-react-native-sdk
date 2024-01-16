# React Native Embrace - Apollo GraphQL

> ## Core Module Required
>
> This module requires [React Native Embrace SDK](https://www.npmjs.com/package/@embrace-io/core).

# Add React Native Apollo Tracker

## Adding Context to Sessions

Embrace can collect basic session data and crashes as you've already seen in the [Crash Reporting](https://embrace.io/docs/react-native/integration/crash-reporting) and [Session Reporting](https://embrace.io/docs/react-native/integration/session-reporting) sections.
Embrace can also collect the screens that your app opened and include it as context within your sessions.
Here's how you add the screen tracker to the session.

## Adding the component

Embrace has a separate module for tracking Apollo network, to use it you will need to add the Apollo Tracker

### Install the component

```sh
yarn add @embrace-io/apollo-graphql

```

```sh
npm install @embrace-io/apollo-graphql
```

### Adding the component to your code

Apply the Apollo GraphQL tracker to your Apollo provider instance.

```javascript
import EmbraceApolloLink from "@embrace-io/apollo-graphql";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  createHttpLink,
  useMutation,
  gql,
  useQuery,
} from "@apollo/client";

const App = () => {
  return <MyApp />;
};
const ApolloWrapper = () => {
  // Start - Add this line
  const embraceCreateHttpLink = new EmbraceApolloLink.build(
    ApolloLink,
    createHttpLink
  );
  // End - Add this line
  const client = new ApolloClient({
    // Use the Embrace create Http Link
    link: embraceCreateHttpLink({
      uri: "https://api.mocki.io/v2/c4d7a195/graphql",
      headers: { "x-emb-path": "/graphql/v1beta/steve" },
    }),

    cache: new InMemoryCache(),
  });
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
};
```

{{< hint info >}}

The build method has a third parameter that is platform, you can pass ios or android, if you only want to track in one of them

{{< /hint >}}
