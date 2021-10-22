import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  HStack,
  VStack,
  Spinner,
} from '@chakra-ui/react';
import React from 'react';
import { useGetNodesQuery } from './api';
import NodeCard from './NodeCard';

export default () => {
  const { data, error, loading } = useGetNodesQuery({ pollInterval: 5000 });
  return (
    <VStack alignItem="flex-start">
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <HStack shouldWrapChildren wrap="wrap" spacing="0">
        {loading && <Spinner />}
        {data?.nodes.map((node) => (
          <NodeCard key={node.url} node={node} />
        ))}
      </HStack>
    </VStack>
  );
};