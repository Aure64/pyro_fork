import { VStack, HStack, Box, Tooltip, Text, Icon } from '@chakra-ui/react';
import React from 'react';
import type { Baker } from './api';
import Card from './Card';
import UpdatedAt from './UpdatedAt';

import { MdLens } from 'react-icons/md';

import { ellipsifyMiddle, formatMutezAsTez, timestampFormat } from './format';

export default ({
  baker: {
    address,
    balance,
    deactivated,
    delegatedBalance,
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
      <HStack w="100%" justifyContent="space-between">
        <HStack maxW={290}>
          <Tooltip label={deactivated ? 'deactivated' : 'active'}>
            <Box>
              <Icon as={MdLens} color={deactivated ? 'grey.500' : 'blue.500'} />
            </Box>
          </Tooltip>
          <Tooltip label={address}>
            <Text>{ellipsifyMiddle(address)}</Text>
          </Tooltip>
        </HStack>
        <Tooltip label="Staking balance">
          <Text>{formatMutezAsTez(stakingBalance)}</Text>
        </Tooltip>
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
            <Box>{gracePeriod}</Box>
          </Tooltip>
          <UpdatedAt updatedAt={updatedAt} />
        </HStack>
      </Box>
    </Card>
  );
};
