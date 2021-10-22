import { Box, HStack, Icon, Text, Tooltip, VStack } from '@chakra-ui/react';
import React from 'react';
import { FaSnowflake } from 'react-icons/fa';
import { MdLens, MdOutlineAccountBalanceWallet } from 'react-icons/md';
import type { Baker } from './api';
import Card from './Card';
import { ellipsifyMiddle, formatMutezAsTez } from './format';
import RelativeTimeRow from './RelativeTimeRow';
import UpdatedAt from './UpdatedAt';
import Priority from './Priority';

const emoji: { [key: string]: string } = {
  missed_bake: '😡',
  baked: '🥖',
  double_baked: '🛑️️',
  missed_endorsement: '😕',
  endorsed: '👍',
  double_endorsed: '🛑️',
};

const eventLabels: { [key: string]: string } = {
  missed_bake: 'Missed bake',
  baked: 'Baked',
  double_baked: 'Double bake️d',
  missed_endorsement: 'Missed endorsement',
  endorsed: 'Endorsed',
  double_endorsed: 'Double endorsed️',
};

const defaultEmoji = '👽'; //should never show up

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
    <Card minHeight="248px">
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
      <VStack spacing={0} alignContent="stretch">
        {recentEvents.map((levelEvents, index) => {
          return (
            <RelativeTimeRow
              key={index}
              highlight={index === 0}
              timestamp={new Date(levelEvents.timestamp)}
            >
              <code>
                {levelEvents.cycle} {levelEvents.level}{' '}
                {levelEvents.events.map((e) => (
                  <Box as="span" key={e.kind}>
                    <Tooltip label={eventLabels[e.kind] || '?'}>
                      <Text as="span">{emoji[e.kind] || defaultEmoji} </Text>
                    </Tooltip>
                    {e.priority && <Priority priority={e.priority} />}{' '}
                    {e.slotCount && (
                      <Tooltip label={`Number of slots: ${e.slotCount}`}>
                        <Text as="span">{e.slotCount}</Text>
                      </Tooltip>
                    )}
                  </Box>
                ))}
              </code>
            </RelativeTimeRow>
          );
        })}
      </VStack>
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
