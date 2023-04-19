import React from 'react';
import App from './App';

import { ChakraProvider } from '@chakra-ui/react';

import { createRoot } from 'react-dom/client';

import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  ApolloProvider,
} from '@apollo/client';

const apolloClient = new ApolloClient({
  link: createHttpLink({ uri: '/gql/' }),
  cache: new InMemoryCache(),
});

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </ApolloProvider>
  </React.StrictMode>,
);
