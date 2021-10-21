import { VStack, HStack, Box, Tooltip, Text, Icon } from '@chakra-ui/react';
import React from 'react';
import type { Baker } from './api';
import Card from './Card';
import UpdatedAt from './UpdatedAt';

import { MdLens, MdOutlineAccountBalanceWallet } from 'react-icons/md';

import { FaSnowflake } from 'react-icons/fa';

import { ellipsifyMiddle, formatMutezAsTez, timestampFormat } from './format';

export default ({
  baker: {
    address,
    balance,
    deactivated,
    frozenBalance,
    stakingBalance,
    recentEvents,
    gracePeriod,
    updatedAt,
  },
}: {
  baker: Baker;
}) => {
  return (
    <Card>
      <HStack w="100%" justifyContent="space-between" alignItems="flex-start">
        <HStack maxW={250}>
          <Tooltip label={deactivated ? 'deactivated' : 'active'}>
            <Box>
              <Icon as={MdLens} color={deactivated ? 'grey.500' : 'blue.500'} />
            </Box>
          </Tooltip>
          <Tooltip label={address}>
            <Text isTruncated>{ellipsifyMiddle(address, 12)}</Text>
          </Tooltip>
        </HStack>
        <VStack align="flex-end" spacing={0}>
          <Tooltip label="Staking balance">
            <Text>{formatMutezAsTez(stakingBalance)}</Text>
          </Tooltip>
          <Tooltip label="Balance">
            <Text fontSize="x-small">
              <Icon as={MdOutlineAccountBalanceWallet} />{' '}
              {formatMutezAsTez(balance)}
            </Text>
          </Tooltip>
          <Tooltip label="Frozen balance">
            <Text fontSize="x-small">
              <Icon as={FaSnowflake} /> {formatMutezAsTez(frozenBalance)}
            </Text>
          </Tooltip>
        </VStack>
      </HStack>
      <Box>
        {recentEvents.map((event) => (
          <Box d="flex" w="100%" justifyContent="space-between">
            <code>
              {event.level} {event.kind}
            </code>
          </Box>
        ))}
      </Box>
      <Box>
        <HStack justifyContent="space-between">
          <Tooltip label="Grace period">
            <Box>Cycle {gracePeriod}</Box>
          </Tooltip>
          <UpdatedAt updatedAt={updatedAt} />
        </HStack>
      </Box>
    </Card>
  );
};
