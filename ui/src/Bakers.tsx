import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Divider,
  HStack,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { useGetBakersQuery } from './api';
import BakerCard from './BakerCard';
import BakersHeader from './BakersHeader';
import Pagination from './Pagination';

export default () => {
  const pageSize = 6;
  const [offset, setOffset] = React.useState(0);

  const { data, error, loading, refetch } = useGetBakersQuery({
    pollInterval: 5000,
    variables: { offset: 0, limit: pageSize },
  });

  const totalCount = data?.bakers.totalCount || 0;

  const setAndRefetch = (newOffset: number) => {
    setOffset(newOffset);
    refetch({ offset: newOffset });
  };

  return (
    <VStack alignItems="flex-start" w="100%">
      <BakersHeader bakerCount={totalCount} />
      <Divider marginBottom="10px" />
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
