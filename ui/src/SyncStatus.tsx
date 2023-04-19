import React from 'react';

import { Box, Icon, Spinner, Tooltip } from '@chakra-ui/react';
import { MdSync, MdSyncProblem, MdSyncDisabled } from 'react-icons/md';

const SyncedIcon = () => <span>💫</span>;

export default ({
  synced,
  peerCount,
}: {
  synced: string | null | undefined;
  peerCount: number | null | undefined;
}) => {
  const hasCount = typeof peerCount === 'number';

  if (hasCount && peerCount === 0) {
    return (
      <Tooltip label="no connected peers">
        <Box display="flex">
          <Icon as={MdSyncDisabled} color="red" />
        </Box>
      </Tooltip>
    );
  }
  return (
    <Tooltip label={synced}>
      <Box>
        {synced === 'synced' && <SyncedIcon />}
        {synced === 'unsynced' && <Spinner color="orange.500" size="xs" />}
        {synced === 'stuck' && <Icon as={MdSyncProblem} color="red" />}
        {!synced && <Icon as={MdSync} color="gray.400" />}
      </Box>
    </Tooltip>
  );
};
