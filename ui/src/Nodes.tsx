import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Heading,
  HStack,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { useGetNodesQuery } from './api';
import { numberFormat } from './format';
import NodeCard from './NodeCard';
import Pagination from './Pagination';

const STORAGE_KEY_OFFSET = 'nodes.offset';
const STORAGE_KEY_PAGE_SIZE = 'nodes.pageSize';

const getInt = (key: string, defaultValue: string) => {
  return parseInt(localStorage.getItem(key) || defaultValue);
};

export default () => {
  const initialOffset = getInt(STORAGE_KEY_OFFSET, '0');
  const initialPageSize = getInt(STORAGE_KEY_PAGE_SIZE, '6');
  const pageSize = initialPageSize;

  const [offset, setOffset] = React.useState(initialOffset);

  const { data, error, loading } = useGetNodesQuery({
    pollInterval: 5000,
    variables: { offset, limit: pageSize },
  });

  const totalCount = data?.nodes.totalCount || 0;

  const setAndRefetch = (newOffset: number) => {
    setOffset(newOffset);
    localStorage.setItem(STORAGE_KEY_OFFSET, newOffset.toString());
  };

  return (
    <VStack alignItems="flex-start" w="100%">
      <HStack w="100%" justifyContent="space-between">
        <Heading>Nodes</Heading> {loading && <Spinner size="sm" />}
        <Heading>
          {typeof totalCount === 'number' && numberFormat.format(totalCount)}
        </Heading>
      </HStack>

      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Pagination
        offset={offset}
        pageSize={pageSize}
        totalCount={totalCount}
        loading={loading}
        onChange={setAndRefetch}
      />

      <HStack shouldWrapChildren wrap="wrap" spacing="0">
        {loading && <Spinner />}
        {data?.nodes.items.map((node) => (
          <NodeCard key={node.url} node={node} />
        ))}
      </HStack>
    </VStack>
  );
};
