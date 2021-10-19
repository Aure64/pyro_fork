import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Divider,
  HStack,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { takeStart, timestampFormat } from './format';
import PeerCount from './PeerCount';
import RecentBlocks from './RecentBlocks';
import SyncStatus from './SyncStatus';

export default ({
  node: {
    url,
    synced,
    peerCount,
    recentBlocks,
    tezosVersion,
    error,
    unableToReach,
    updatedAt,
  },
}: {
  node: {
    __typename?: 'TezosNode';
    url: string;
    error?: string | null | undefined;
    unableToReach?: boolean | null | undefined;
    synced?: string | null | undefined;
    updatedAt: string;
    peerCount?: number | null | undefined;
    recentBlocks: Array<{
      __typename?: 'BlockInfo';
      protocol: string;
      hash: string;
      level: number;
      timestamp: string;
      priority: number;
    }>;
    tezosVersion: {
      __typename?: 'TezosVersion';
      version: string;
      commitHash: string;
      chainName: string;
    };
  };
}) => (
  <Box
    key={url}
    borderWidth="1px"
    rounded="md"
    padding="10px"
    minW="360px"
    maxW="360px"
    marginRight="10px"
    marginBottom="10px"
  >
    <VStack align="flex-start">
      <Box w="100%" d="flex" justifyContent="space-between">
        <VStack align="flex-start" spacing={0}>
          <HStack maxW={290}>
            <SyncStatus synced={synced} />

            <Tooltip label={url}>
              <Text as="span" isTruncated>
                {new URL(url).hostname}
              </Text>
            </Tooltip>
          </HStack>
          {!unableToReach && (
            <Text fontSize="x-small" isTruncated>
              {tezosVersion.chainName}
            </Text>
          )}
          {!unableToReach && (
            <Tooltip label={recentBlocks[0]?.protocol}>
              <Text fontSize="x-small" isTruncated>
                {takeStart(recentBlocks[0]?.protocol, 12)}
              </Text>
            </Tooltip>
          )}
        </VStack>
        {!unableToReach && <PeerCount peerCount={peerCount} />}
      </Box>
      <Divider />
      <Box w="100%">
        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <RecentBlocks recentBlocks={recentBlocks} />
      </Box>
      <Box w="100%" justifyContent="space-between" d="flex" fontSize="xs">
        <HStack>
          {tezosVersion.version && <Text>v{tezosVersion.version}</Text>}
          {tezosVersion.commitHash && (
            <Text>v{takeStart(tezosVersion.commitHash)}</Text>
          )}
        </HStack>
        <Text color="gray.400" as="i" align="end">
          Updated: {timestampFormat.format(new Date(updatedAt))}
        </Text>
      </Box>
    </VStack>
  </Box>
);
