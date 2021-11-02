import { HStack, Text, Tooltip } from '@chakra-ui/react';
import React from 'react';
import {
  useGetBakersQuery,
  useGetNetworkInfoQuery,
  GetBakersQuery,
} from './api';
import BakerCard from './BakerCard';
import { takeStart } from './format';
import PaginatedSection from './PaginatedSection';

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

export default () => {
  const { data } = useGetNetworkInfoQuery({
    pollInterval: 15e3,
  });

  const networkInfo = data?.networkInfo;

  return (
    <PaginatedSection
      title="Bakers"
      storageNs="bakers"
      query={useGetBakersQuery}
      getCount={(data: GetBakersQuery) => data.bakers.totalCount}
      render={({ bakers: { items } }: GetBakersQuery) =>
        items.map((baker) => <BakerCard key={baker.address} baker={baker} />)
      }
      renderSubHeader={() => {
        return (
          (networkInfo && (
            <HStack flexWrap="wrap">
              <InfoItem tooltip="Chain name" text={networkInfo.chainName} />
              <InfoItem
                tooltip="Current protocol"
                text={takeStart(networkInfo.protocol, 12)}
              />
              <InfoItem tooltip="Cycle" text={networkInfo.cycle} />
              <InfoItem tooltip="Level" text={networkInfo.level} />
            </HStack>
          )) || <></>
        );
      }}
    />
  );
};
