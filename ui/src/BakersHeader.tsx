import {
  VStack,
  Heading,
  HStack,
  Spinner,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { useGetNetworkInfoQuery } from './api';
import { takeStart, numberFormat } from './format';

const InfoItem = ({
  text,
  tooltip,
  fontSize = 'small',
}: {
  text: string | number | undefined | null;
  tooltip: string | undefined;
  fontSize?: string;
}) => (
  <Tooltip label={tooltip}>
    <Text fontSize={fontSize} fontFamily="mono">
      {text}
    </Text>
  </Tooltip>
);

export default ({ bakerCount }: { bakerCount: number | null }) => {
  const { data, loading } = useGetNetworkInfoQuery({
    pollInterval: 5000,
  });
  const networkInfo = data?.networkInfo;
  return (
    <VStack
      spacing={0}
      justifyContent="space-between"
      w="100%"
      alignItems="baseline"
      flexWrap="wrap"
    >
      <HStack w="100%" justifyContent="space-between">
        <Heading>Bakers</Heading> {loading && <Spinner size="sm" />}
        <Heading>
          {typeof bakerCount === 'number' && numberFormat.format(bakerCount)}
        </Heading>
      </HStack>
      {networkInfo && (
        <HStack flexWrap="wrap">
          <InfoItem tooltip="Chain name" text={networkInfo.chainName} />
          <InfoItem
            tooltip="Current protocol"
            text={takeStart(networkInfo.protocol, 12)}
          />
          <InfoItem tooltip="Cycle" text={networkInfo.cycle} />
          <InfoItem tooltip="Level" text={networkInfo.level} />
        </HStack>
      )}
    </VStack>
  );
};
