import { Box, Divider, VStack } from '@chakra-ui/react';
import React from 'react';

export default ({
  children,
  minHeight,
}: {
  children: Array<React.ReactNode>;
  minHeight: string;
}) => (
  <Box
    borderWidth="1px"
    rounded="md"
    padding="10px"
    minW="360px"
    maxW="360px"
    minHeight={minHeight || '195px'}
    marginRight="10px"
    marginBottom="10px"
  >
    <VStack w="100%" align="flex-start">
      {children[0]}
      <Divider />
      <Box w="100%">{children[1]}</Box>
      <Divider />
      <Box w="100%" fontSize="xs">
        {children[2]}
      </Box>
    </VStack>
  </Box>
);
