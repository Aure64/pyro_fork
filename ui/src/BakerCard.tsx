import {
  Alert,
  AlertDescription,
  AlertIcon,
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
  MdVpnKey,
  MdSwapHoriz,
  MdError,
} from 'react-icons/md';
import type { Baker, BakerEvent, LevelEvents } from './api';
import Card from './Card';
import { ellipsifyMiddle, formatMutezAsTez } from './format';
import RelativeTimeRow from './RelativeTimeRow';
import UpdatedAt from './UpdatedAt';
import Priority from './Priority';
import type { GraphQLError } from 'graphql';

import { groupBy, partition } from 'lodash';

const emoji: { [key: string]: string } = {
  missed_bake: '😡',
  missed_bonus: '😾',
  baked: '🥖',
  double_baked: '✂️️️️',
  missed_endorsement: '😕',
  endorsed: '👍',
  double_endorsed: '‼️️️',
  double_preendorsed: '‼️️️',
};

const eventLabels: { [key: string]: string } = {
  missed_bake: 'Missed bake',
  missed_bonus: 'Missed bonus',
  baked: 'Baked',
  double_baked: 'Double bake️d',
  missed_endorsement: 'Missed endorsement',
  endorsed: 'Endorsed',
  double_endorsed: 'Double endorsed️',
  double_preendorsed: 'Double preendorsed️',
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
    consensusKey,
    blocksPerCycle,
    lastProcessed,
  },
  errors,
}: {
  baker: Omit<Baker, 'headDistance' | 'atRiskThreshold'>;
  errors?: GraphQLError[];
}) => {
  const healthy = !deactivated && isHealthy(recentEvents);

  const deactivationStatusText =
    deactivated === null || errors
      ? `Error loading data`
      : deactivated
      ? 'deactivated'
      : atRisk
      ? `may be deactivated at the end of cycle ${gracePeriod}`
      : healthy
      ? 'active'
      : 'active, but not healthy';

  const deactivationStatusColor =
    deactivated === null || errors
      ? 'red.500'
      : deactivated
      ? 'gray.500'
      : atRisk
      ? 'red.500'
      : healthy
      ? 'blue.500'
      : 'orange.500';

  const deactivationStatusIcon =
    deactivated === null || errors
      ? MdError
      : deactivated
      ? MdCloudOff
      : atRisk
      ? MdOutlineCloud
      : MdCloud;

  let cycleProgress = 0;
  const cyclePosition = lastProcessed?.cyclePosition;
  if (cyclePosition) {
    cycleProgress = 100 * (1 - cyclePosition / blocksPerCycle);
  }

  let participationReserve = 0;
  if (participation) {
    const totalAllowedMissedSlots =
      participation.missed_slots + participation.remaining_allowed_missed_slots;
    participationReserve =
      totalAllowedMissedSlots > 0
        ? 100 * (1 - participation.missed_slots / totalAllowedMissedSlots)
        : 0;
  }

  const marginOfWarningL = Math.min(8, cycleProgress);
  const marginOfWarningH = Math.min(8, 100 - cycleProgress);
  const b1 = cycleProgress - marginOfWarningL;
  const b2 = cycleProgress + marginOfWarningH;

  let rewardsRiskColor =
    participation?.expected_endorsing_rewards === '0' ? 'red' : 'green';
  if (participationReserve < b1) {
    rewardsRiskColor = 'red';
  } else if (b1 < participationReserve && participationReserve < b2) {
    rewardsRiskColor = 'yellow';
  }

  const usesConsensusKey = consensusKey && consensusKey.active !== address;
  const consensusKeyIconColor = usesConsensusKey ? 'blue.500' : 'gray.400';

  const [errorsWithNodeErrors, otherErrors] = partition(
    errors,
    (x) => (x.extensions as any).error?.nodeErrors,
  );

  return (
    <Card minHeight="248px">
      <HStack w="100%" justifyContent="space-between" alignItems="flex-start">
        <VStack alignItems="flex-start" spacing={0}>
          <HStack maxW={250}>
            <Tooltip label={deactivationStatusText}>
              <Box>
                <Icon
                  display="block"
                  as={deactivationStatusIcon}
                  color={deactivationStatusColor}
                />
              </Box>
            </Tooltip>
            <Tooltip label={address}>
              <Link href={explorerUrl || undefined} isExternal>
                <Text fontFamily="mono" fontSize="small" isTruncated>
                  {ellipsifyMiddle(address, 12)}
                </Text>
              </Link>
            </Tooltip>
          </HStack>

          {consensusKey && (
            <HStack maxW={250}>
              <Tooltip label="Consensus key">
                <Box>
                  <Icon
                    color={consensusKeyIconColor}
                    display="block"
                    as={MdVpnKey}
                  />
                </Box>
              </Tooltip>
              <Tooltip label={consensusKey.active}>
                <Link href={consensusKey.explorerUrl || undefined} isExternal>
                  <Text
                    fontFamily="mono"
                    fontSize="x-small"
                    fontWeight={usesConsensusKey ? 'bold' : undefined}
                    isTruncated
                  >
                    {ellipsifyMiddle(consensusKey.active, 12)}
                  </Text>
                </Link>
              </Tooltip>
              {consensusKey.pendings && consensusKey.pendings.length > 0 && (
                <>
                  <Tooltip
                    label={`Pending consensus key ${consensusKey.pendings[0].pkh}`}
                  >
                    <Box>
                      <Icon color="blue.500" display="block" as={MdSwapHoriz} />
                    </Box>
                  </Tooltip>
                  <Tooltip label="Pending consensus key activation cycle">
                    <Box fontSize="x-small">
                      {consensusKey.pendings[0].cycle}
                    </Box>
                  </Tooltip>
                </>
              )}
            </HStack>
          )}

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
        {errors &&
          Object.keys(
            groupBy(
              errorsWithNodeErrors.flatMap(
                (x) => (x.extensions as any).error?.nodeErrors || [],
              ),
              'id',
            ),
          ).map((nodeErrorId) => {
            return (
              <Alert status="error" key={nodeErrorId}>
                <AlertIcon />
                <AlertDescription>{nodeErrorId}</AlertDescription>
              </Alert>
            );
          })}

        {errors &&
          Object.keys(
            groupBy(
              otherErrors.map(
                (x) =>
                  (x.extensions as any).error || {
                    statusText: 'Unknown error',
                  },
              ),
              'statusText',
            ),
          ).map((statusText) => {
            return (
              <Alert status="error" key={statusText}>
                <AlertIcon />
                <AlertDescription>{statusText}</AlertDescription>
              </Alert>
            );
          })}

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
