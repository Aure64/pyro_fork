import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import React from 'react';
import { useGetNodesQuery } from './api';
import NodeCard from './NodeCard';

export default () => {
  const { data, error, loading } = useGetNodesQuery({ pollInterval: 5000 });
  return (
    <HStack shouldWrapChildren wrap="wrap" spacing="0">
      {loading && <Spinner />}
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      {data?.nodes.map((node) => (
        <NodeCard key={node.url} node={node} />
      ))}
    </HStack>
  );
};
