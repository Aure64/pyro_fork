import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  HStack,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { useGetBakersQuery } from './api';
import BakerCard from './BakerCard';
import BakersHeader from './BakersHeader';
import Pagination from './Pagination';

const STORAGE_KEY_OFFSET = 'bakers.offset';
const STORAGE_KEY_PAGE_SIZE = 'bakers.pageSize';

const getInt = (key: string, defaultValue: string) => {
  return parseInt(localStorage.getItem(key) || defaultValue);
};

export default () => {
  const initialOffset = getInt(STORAGE_KEY_OFFSET, '0');
  const initialPageSize = getInt(STORAGE_KEY_PAGE_SIZE, '6');
  const pageSize = initialPageSize;

  const [offset, setOffset] = React.useState(initialOffset);

  const { data, error, loading } = useGetBakersQuery({
    pollInterval: 5000,
    variables: { offset, limit: pageSize },
  });

  const totalCount = data?.bakers.totalCount || 0;

  const setAndRefetch = (newOffset: number) => {
    setOffset(newOffset);
    localStorage.setItem(STORAGE_KEY_OFFSET, newOffset.toString());
  };

  return (
    <VStack alignItems="flex-start" w="100%">
      <BakersHeader bakerCount={totalCount} />
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
        {data?.bakers.items.map((baker) => (
          <BakerCard key={baker.address} baker={baker} />
        ))}
      </HStack>
    </VStack>
  );
};
