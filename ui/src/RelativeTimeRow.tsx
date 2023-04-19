import React from 'react';

import { Box, Text, Tooltip } from '@chakra-ui/react';
import { formatRelativeTime, timestampFormat } from './format';

export default ({
  children,
  highlight,
  timestamp,
}: {
  children: React.ReactNode;
  highlight: boolean;
  timestamp: Date;
}) => {
  return (
    <Box
      display="flex"
      w="100%"
      justifyContent="space-between"
      alignItems="baseline"
      fontWeight={highlight ? 'bold' : 'normal'}
      color={highlight ? 'black' : 'gray.600'}
    >
      {children}
      <Tooltip label={timestampFormat.format(timestamp)}>
        <Text fontSize="xs" fontFamily="monospace">
          {formatRelativeTime(timestamp.getTime())}
        </Text>
      </Tooltip>
    </Box>
  );
};
