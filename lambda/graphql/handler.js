const { ApolloServer, gql } = require('apollo-server-lambda');

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const server = new ApolloServer({ typeDefs, resolvers });

exports.handler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
});