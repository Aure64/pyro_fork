import { Tooltip, HStack, Icon, Text } from '@chakra-ui/react';
import React from 'react';
import { MdUpdate } from 'react-icons/md';
import { timestampFormat } from './format';

export default ({ updatedAt }: { updatedAt: string }) => {
  return (
    <Tooltip label="Last updated">
      <HStack spacing={0.5}>
        <Icon as={MdUpdate} color="gray.400" />
        <Text color="gray.400" as="i" align="end">
          {timestampFormat.format(new Date(updatedAt))}
        </Text>
      </HStack>
    </Tooltip>
  );
};
