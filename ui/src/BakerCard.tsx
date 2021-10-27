import {
  Link,
  Box,
  HStack,
  Icon,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
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
    explorerUrl,
    balance,
    deactivated,
    frozenBalance,
    stakingBalance,
    recentEvents,
    gracePeriod,
    atRisk,
    updatedAt,
  },
}: {
  baker: Baker;
}) => {
  const deactivationStatusText = deactivated
    ? 'deactivated'
    : atRisk
    ? 'will be deactivated soon'
    : 'active';
  const deactivationStatusColor = deactivated
    ? 'gray.500'
    : atRisk
    ? 'red.500'
    : 'blue.500';
  return (
    <Card minHeight="248px">
      <HStack w="100%" justifyContent="space-between" alignItems="flex-start">
        <HStack maxW={250}>
          <Tooltip label={deactivationStatusText}>
            <Box>
              <Icon as={MdLens} color={deactivationStatusColor} />
            </Box>
          </Tooltip>
          <Tooltip label={address}>
            <Link href={explorerUrl || undefined} isExternal>
              <Text isTruncated>{ellipsifyMiddle(address, 12)}</Text>
            </Link>
          </Tooltip>
        </HStack>
        <VStack align="flex-end" spacing={0}>
          <Tooltip label="Staking balance">
            <Text fontSize="small" fontFamily="mono">
              {formatMutezAsTez(stakingBalance)}
            </Text>
          </Tooltip>
          <Tooltip label="Balance">
            <Text fontSize="x-small" fontFamily="mono">
              <Icon as={MdOutlineAccountBalanceWallet} />{' '}
              {formatMutezAsTez(balance)}
            </Text>
          </Tooltip>
          <Tooltip label="Frozen balance">
            <Text fontSize="x-small" fontFamily="mono">
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
                {levelEvents.cycle}{' '}
                <Link href={levelEvents.explorerUrl || undefined} isExternal>
                  {levelEvents.level}
                </Link>{' '}
                {levelEvents.events.map((e) => (
                  <Box as="span" key={e.kind}>
                    <Tooltip label={eventLabels[e.kind] || '?'}>
                      <Text as="span">{emoji[e.kind] || defaultEmoji} </Text>
                    </Tooltip>
                    {typeof e.priority === 'number' && (
                      <Priority priority={e.priority} />
                    )}{' '}
                    {typeof e.slotCount === 'number' && (
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
          <Box>Grace period end: cycle {gracePeriod}</Box>
          <UpdatedAt updatedAt={updatedAt} />
        </HStack>
      </Box>
    </Card>
  );
};
