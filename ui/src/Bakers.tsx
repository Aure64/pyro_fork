import { HStack, Text, Tooltip, Box } from '@chakra-ui/react';
import React from 'react';
import {
  useGetBakersQuery,
  useGetNetworkInfoQuery,
  GetBakersQuery,
} from './api';
import BakerCard from './BakerCard';
import { takeStart } from './format';
import PaginatedSection from './PaginatedSection';
import { CircularProgress, CircularProgressLabel } from '@chakra-ui/react';
import type { GraphQLErrors } from '@apollo/client/errors';

import { groupBy } from 'lodash';

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
      render={(
        { bakers: { items } }: GetBakersQuery,
        errors?: GraphQLErrors,
      ) => {
        const errorsByItem = errors
          ? groupBy(
              errors.filter((x) => x.path && x.path[1] === 'items'),
              (x) => x.path && x.path[2],
            )
          : {};
        return items.map((baker, index) => (
          <BakerCard
            key={baker.address}
            baker={baker}
            errors={errorsByItem[index]}
          />
        ));
      }}
      renderSubHeader={() => {
        return (
          (networkInfo && (
            <HStack flexWrap="wrap">
              <Tooltip label={`Cycle ${networkInfo.cycle}`}>
                <Box>
                  <CircularProgress
                    value={
                      (100 * networkInfo.cyclePosition) /
                      networkInfo.blocksPerCycle
                    }
                    color="green.400"
                    size="24px"
                  >
                    <CircularProgressLabel>
                      {networkInfo.cycle}
                    </CircularProgressLabel>
                  </CircularProgress>
                </Box>
              </Tooltip>
              <InfoItem tooltip="Level" text={networkInfo.level} />

              <InfoItem tooltip="Chain name" text={networkInfo.chainName} />
              <InfoItem
                tooltip="Current protocol"
                text={takeStart(networkInfo.protocol, 12)}
              />
            </HStack>
          )) || <></>
        );
      }}
    />
  );
};
