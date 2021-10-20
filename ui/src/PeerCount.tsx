import { Stat, StatHelpText, StatNumber } from '@chakra-ui/react';
import React from 'react';

export default ({ peerCount }: { peerCount: number | null | undefined }) => {
  const hasCount = typeof peerCount === 'number';
  return (
    <Stat paddingLeft="5px" flexGrow={0} textAlign="center">
      <StatNumber
        color={hasCount ? (peerCount < 4 ? 'red' : 'black') : 'gray.400'}
      >
        {hasCount ? peerCount : '?'}
      </StatNumber>
      <StatHelpText marginBottom={0}>peers</StatHelpText>
    </Stat>
  );
};
