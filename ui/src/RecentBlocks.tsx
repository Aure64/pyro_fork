import { Box } from '@chakra-ui/react';
import React from 'react';
import { ellipsifyMiddle } from './format';
import Priority from './Priority';
import RelativeTimeRow from './RelativeTimeRow';
import type { BlockInfo } from './api';

export default ({ recentBlocks }: { recentBlocks: Array<BlockInfo> }) => (
  <>
    {recentBlocks.slice(0, 3).map((block, index) => {
      return (
        <RelativeTimeRow
          key={block.hash}
          highlight={index === 0}
          timestamp={new Date(block.timestamp)}
        >
          <Box>
            <code>
              {block.level} <Priority priority={block.priority} />
            </code>{' '}
            <code>{ellipsifyMiddle(block.hash)}</code>{' '}
          </Box>
        </RelativeTimeRow>
      );
    })}
  </>
);
