import React from 'react';

import { Box, Text, Tooltip } from '@chakra-ui/react';
import { ellipsifyMiddle, formatRelativeTime, timestampFormat } from './format';

const priorityColors: { [key: number]: string } = {
  '0': 'green.600',
  '1': 'yellow.400',
  '2': 'orange.400',
};

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
      const priorityColor = priorityColors[block.priority] || 'red.500';
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
              {block.level}{' '}
              <Text color={priorityColor} as="span">
                {block.priority}
              </Text>
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
