import React from 'react';

import { Box } from '@chakra-ui/react';
import { HStack } from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/react';
import { VStack } from '@chakra-ui/react';

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';

import { useGetNodesQuery } from './api';

const takeStart = (str: string | undefined | null) => {
  return str && `${str.substr(0, 8)}`;
};

const ellipsifyMiddle = (str: string | undefined | null) => {
  return str && `${takeStart(str)}..${str.substr(-4)}`;
};

interface AppProps {}

function App({}: AppProps) {
  const { data, error, loading } = useGetNodesQuery({ pollInterval: 5000 });
  return (
    <Box>
      {loading && <Spinner />}
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      {data?.nodes.map((node) => (
        <Box m="10px" borderWidth="1px" rounded="md" padding="10px">
          <VStack align="flex-start">
            <HStack>
              <Box>
                {node.url} {node.synced} ({node.peerCount})
              </Box>
            </HStack>
            <Box>
              {node.level} {ellipsifyMiddle(node.head)}
            </Box>
            <Box>
              Updated:{' '}
              {new Intl.DateTimeFormat([], {
                dateStyle: 'short',
                timeStyle: 'short',
              }).format(new Date(node.updatedAt))}
            </Box>
          </VStack>
        </Box>
      ))}
    </Box>
  );
}

export default App;
