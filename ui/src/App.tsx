import React from 'react';

import { Text } from '@chakra-ui/react';
import { Heading } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import { HStack } from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/react';
import { VStack } from '@chakra-ui/react';
import { Tooltip } from '@chakra-ui/react';
import { Divider } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';

import { MdSync } from 'react-icons/md';
import { MdSyncProblem } from 'react-icons/md';

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';

import { Stat, StatLabel, StatNumber } from '@chakra-ui/react';

import { useGetNodesQuery } from './api';

import useInterval from './use-interval';

const relativeTimeFormat = new Intl.RelativeTimeFormat([], {
  style: 'short',
});

const timestampFormat = new Intl.DateTimeFormat([], {
  dateStyle: 'short',
  timeStyle: 'short',
});

const takeStart = (str: string | undefined | null) => {
  return str && `${str.substr(0, 5)}`;
};

const ellipsifyMiddle = (str: string | undefined | null) => {
  return str && `${takeStart(str)}..${str.substr(-4)}`;
};

interface AppProps {}

function App({}: AppProps) {
  const { data, error, loading } = useGetNodesQuery({ pollInterval: 5000 });
  const [count, setCount] = React.useState<number>(0);

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  return (
    <Box p="20px">
      <Heading>Nodes</Heading>
      <Divider marginBottom="10px" />
      <HStack shouldWrapChildren wrap="wrap" spacing="0">
        {loading && <Spinner />}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle mr={2}>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        {data?.nodes.map((node) => (
          <Box
            key={node.url}
            borderWidth="1px"
            rounded="md"
            padding="10px"
            minW="350px"
            maxW="350px"
            marginRight="10px"
            marginBottom="10px"
          >
            <VStack align="flex-start">
              <Box w="100%" d="flex" justifyContent="space-between">
                <VStack align="flex-start">
                  <Tooltip label={node.url}>
                    <Text as="span">{new URL(node.url).hostname}</Text>
                  </Tooltip>
                  <Text fontSize="sm">
                    {node.synced === 'synced' && (
                      <Icon as={MdSync} color="green" />
                    )}
                    {!!node.synced && node.synced !== 'synced' && (
                      <Icon as={MdSyncProblem} color="red" />
                    )}
                    {!node.synced && <Icon as={MdSync} color="gray" />}{' '}
                    {node.synced}
                  </Text>
                </VStack>
                <Stat paddingLeft="5px" flexGrow={0}>
                  <StatLabel>Peers</StatLabel>
                  <StatNumber
                    color={
                      node.peerCount
                        ? node.peerCount < 4
                          ? 'red'
                          : 'black'
                        : 'gray.400'
                    }
                  >
                    {node.peerCount || '?'}
                  </StatNumber>
                </Stat>
              </Box>
              <Divider />
              <Box w="100%">
                {node.recentBlocks.slice(0, 3).map((block, index) => (
                  <Box
                    key={block.level}
                    d="flex"
                    w="100%"
                    justifyContent="space-between"
                    alignItems="baseline"
                    fontWeight={index ? 'normal' : 'bold'}
                    color={index ? 'gray.600' : 'black'}
                  >
                    <Box>
                      <code>
                        {block.level} {block.priority}
                      </code>{' '}
                      <code>{ellipsifyMiddle(block.hash)}</code>{' '}
                    </Box>
                    <Text fontSize="xs" fontFamily="monospace">
                      {relativeTimeFormat.format(
                        Math.round(
                          (new Date(block.timestamp).getTime() - Date.now()) /
                            1000,
                        ),
                        'seconds',
                      )}
                    </Text>
                  </Box>
                ))}
              </Box>
              <Box
                w="100%"
                justifyContent="space-between"
                d="flex"
                fontSize="xs"
              >
                <HStack>
                  {node.tezosVersion.version && (
                    <Text>v{node.tezosVersion.version}</Text>
                  )}
                  {node.tezosVersion.commitHash && (
                    <Text>v{takeStart(node.tezosVersion.commitHash)}</Text>
                  )}
                </HStack>
                <Text color="gray.400" as="i" align="end">
                  Updated: {timestampFormat.format(new Date(node.updatedAt))}
                </Text>
              </Box>
            </VStack>
          </Box>
        ))}
      </HStack>
    </Box>
  );
}

export default App;
