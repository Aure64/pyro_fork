import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  HStack,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import type { TezosNode } from './api';
import Card from './Card';
import { takeStart } from './format';
import PeerCount from './PeerCount';
import RecentBlocks from './RecentBlocks';
import SyncStatus from './SyncStatus';
import UpdatedAt from './UpdatedAt';

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
  node: TezosNode;
}) => (
  <Card>
    <HStack w="100%" justifyContent="space-between">
      <VStack align="flex-start" spacing={0}>
        <HStack maxW={290}>
          <SyncStatus synced={synced} peerCount={peerCount} />
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
    </HStack>
    <Box>
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <RecentBlocks recentBlocks={recentBlocks} />
    </Box>
    <Box justifyContent="space-between" display="flex" alignContent="center">
      <HStack spacing={1}>
        {tezosVersion.version && <Text>v{tezosVersion.version}</Text>}
        {tezosVersion.commitHash && (
          <Text>({takeStart(tezosVersion.commitHash)})</Text>
        )}
      </HStack>
      <UpdatedAt updatedAt={updatedAt} />
    </Box>
  </Card>
);
