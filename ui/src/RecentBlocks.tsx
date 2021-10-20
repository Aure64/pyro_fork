import React from 'react';

import { Box, Text, Tooltip } from '@chakra-ui/react';
import { ellipsifyMiddle, formatRelativeTime, timestampFormat } from './format';

export default ({
  recentBlocks,
}: {
  recentBlocks: Array<{
    protocol: string;
    hash: string;
    level: number;
    timestamp: string;
    priority: number;
  }>;
}) => (
  <>
    {recentBlocks.slice(0, 3).map((block, index) => {
      const blockTimeStamp = new Date(block.timestamp);
      return (
        <Box
          key={block.level}
          d="flex"
          w="100%"
          justifyContent="space-between"
          alignItems="baseline"
          fontWeight={index ? 'normal' : 'bold'}
          color={index ? 'gray.600' : 'black'}
        >
          <Box>
            <code>
              {block.level} {block.priority}
            </code>{' '}
            <code>{ellipsifyMiddle(block.hash)}</code>{' '}
          </Box>
          <Tooltip label={timestampFormat.format(blockTimeStamp)}>
            <Text fontSize="xs" fontFamily="monospace">
              {formatRelativeTime(blockTimeStamp.getTime())}
            </Text>
          </Tooltip>
        </Box>
      );
    })}
  </>
);
