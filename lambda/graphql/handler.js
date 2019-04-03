import { graphqlLambda, graphiqlLambda } from 'apollo-server-lambda';
import { makeExecutableSchema } from 'graphql-tools';
import { schema } from './schema';
import { resolvers } from './resolvers';

const myGraphQLSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});

module.exports.handler = async (event) => {
  const callbackWithHeaders = (error, output) => {
    output.headers['Access-Control-Allow-Origin'] = '*';
    callback(error, output);
  }
  const handler = graphqlLambda({ schema: myGraphQLSchema });
  return handler(event, context, callbackWithHeaders);
};