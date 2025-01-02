const ApolloServer = require("@apollo/server").ApolloServer;
const startStandaloneServer =
  require("@apollo/server/standalone").startStandaloneServer;

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }
`;

const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
  },
  {
    title: "Harry Potter and the Chamber of Secrets",
    author: "J. K. Rowling",
  },
  {
    title: "Jurassic Park",
    author: "Michael Crichton",
  },
  {title: "The Lord of the Rings", author: "J. R. R. Tolkien"},
];

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const serverInstance = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  // Passing an ApolloServer instance to the `startStandaloneServer` function:
  //  1. creates an Express app
  //  2. installs your ApolloServer instance as middleware
  //  3. prepares your app to handle incoming requests
  const {url} = await startStandaloneServer(serverInstance, {
    listen: {port: 4000},
  });

  console.log(`🚀  Server ready at: ${url}`);
};

startApolloServer();
