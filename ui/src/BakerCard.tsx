import {
  Link,
  Box,
  HStack,
  Icon,
  Text,
  Tooltip,
  VStack,
  Progress,
} from '@chakra-ui/react';
import React from 'react';
import { FaSnowflake } from 'react-icons/fa';
import {
  MdCloud,
  MdCloudOff,
  MdOutlineCloud,
  MdOutlineAccountBalanceWallet,
} from 'react-icons/md';
import type { Baker, BakerEvent, LevelEvents } from './api';
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

const isHealthyEvent = (e: BakerEvent) => {
  return e.kind === 'endorsed' || e.kind === 'baked';
};

function identity<Type>(arg: Type): Type {
  return arg;
}

const isHealthy = (recentEvents: LevelEvents[]) =>
  recentEvents.length === 0 ||
  recentEvents.map((e) => e.events.some(isHealthyEvent)).some(identity);

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
    participation,
    blocksPerCycle,
    lastProcessed,
  },
}: {
  baker: Omit<Baker, 'headDistance'>;
}) => {
  const healthy = !deactivated && isHealthy(recentEvents);

  const deactivationStatusText = deactivated
    ? 'deactivated'
    : atRisk
    ? 'will be deactivated soon'
    : healthy
    ? 'active'
    : 'active, but not healthy';

  const deactivationStatusColor = deactivated
    ? 'gray.500'
    : atRisk
    ? 'red.500'
    : healthy
    ? 'blue.500'
    : 'orange.500';

  const deactivationStatusIcon = deactivated
    ? MdCloudOff
    : atRisk
    ? MdOutlineCloud
    : MdCloud;

  let cycleProgress = 0;
  const cyclePosition = lastProcessed?.cyclePosition;
  if (cyclePosition) {
    cycleProgress = 100 * (1 - cyclePosition / blocksPerCycle);
  }

  const participationReserve = participation
    ? 100 *
      (1 -
        participation.missed_slots /
          (participation.missed_slots +
            participation.remaining_allowed_missed_slots))
    : 0;

  const marginOfWarning = 8;
  const b1 = cycleProgress - marginOfWarning;
  const b2 = cycleProgress + marginOfWarning;

  let rewardsRiskColor = 'green';
  if (participationReserve < b1) {
    rewardsRiskColor = 'red';
  } else if (b1 < participationReserve && participationReserve < b2) {
    rewardsRiskColor = 'yellow';
  }

  return (
    <Card minHeight="248px">
      <HStack w="100%" justifyContent="space-between" alignItems="flex-start">
        <VStack>
          <HStack maxW={250}>
            <Tooltip label={deactivationStatusText}>
              <Box>
                <Icon
                  as={deactivationStatusIcon}
                  color={deactivationStatusColor}
                />
              </Box>
            </Tooltip>
            <Tooltip label={address}>
              <Link href={explorerUrl || undefined} isExternal>
                <Text isTruncated>{ellipsifyMiddle(address, 12)}</Text>
              </Link>
            </Tooltip>
          </HStack>
          {participation && (
            <HStack w="100%" d="flex">
              <Tooltip
                label={`Missed slots: ${participation.missed_slots} of ${
                  participation.remaining_allowed_missed_slots +
                  participation.missed_slots
                } allowed`}
              >
                <Box flexGrow={1} position="relative">
                  <Box
                    w="2px"
                    h="100%"
                    bg="white"
                    opacity={0.8}
                    position="absolute"
                    left={`${cycleProgress}%`}
                    zIndex={100}
                  />
                  <Progress
                    value={participationReserve}
                    colorScheme={rewardsRiskColor}
                  />
                </Box>
              </Tooltip>
              <Tooltip label="Expected endorsing rewards">
                <Text
                  fontSize="x-small"
                  fontFamily="mono"
                  fontWeight="bold"
                  color={`${rewardsRiskColor}.500`}
                >
                  {formatMutezAsTez(participation.expected_endorsing_rewards)}
                </Text>
              </Tooltip>
            </HStack>
          )}
        </VStack>
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
                        <Text as="span">{e.slotCount} </Text>
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
