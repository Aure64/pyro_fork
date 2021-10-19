import React from 'react';

import { Box, Icon, Spinner, Tooltip } from '@chakra-ui/react';
import { MdSync, MdSyncProblem } from 'react-icons/md';

export default ({ synced }: { synced: string | null | undefined }) => (
  <Tooltip label={synced}>
    <Box>
      {synced === 'synced' && <Icon as={MdSync} color="green" />}
      {synced === 'unsynced' && <Spinner color="orange.500" size="xs" />}
      {synced === 'stuck' && <Icon as={MdSyncProblem} color="red" />}
      {!synced && <Icon as={MdSync} color="gray.400" />}
    </Box>
  </Tooltip>
);
