import React from 'react';

import { Box, Text } from '@chakra-ui/react';
import { ellipsifyMiddle, relativeTimeFormat } from './format';

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
    {recentBlocks.slice(0, 3).map((block, index) => (
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
        <Text fontSize="xs" fontFamily="monospace">
          {relativeTimeFormat.format(
            Math.round(
              (new Date(block.timestamp).getTime() - Date.now()) / 1000,
            ),
            'seconds',
          )}
        </Text>
      </Box>
    ))}
  </>
);
