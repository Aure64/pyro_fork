import { HStack, Text, Tooltip, VStack } from '@chakra-ui/react';
import React, { MouseEventHandler } from 'react';
import { useGetNetworkInfoQuery } from './api';
import { takeStart } from './format';
import SectionHeader from './SectionHeaderWithSettings';

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

export default ({
  bakerCount,
  onSettingsClick,
}: {
  bakerCount: number | null;
  onSettingsClick: MouseEventHandler;
}) => {
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
      <SectionHeader
        text="Bakers"
        loading={loading}
        count={bakerCount}
        onIconClick={onSettingsClick}
      />
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
