import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import { ellipsifyMiddle } from './format';
import RelativeTimeRow from './RelativeTimeRow';

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
      const priorityColor = priorityColors[block.priority] || 'red.500';
      return (
        <RelativeTimeRow
          highlight={index === 0}
          timestamp={new Date(block.timestamp)}
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
        </RelativeTimeRow>
      );
    })}
  </>
);
