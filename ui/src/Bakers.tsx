import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  HStack,
  Spinner,
  VStack,
  Divider,
} from '@chakra-ui/react';
import React from 'react';
import { useGetBakersQuery } from './api';
import BakerCard from './BakerCard';
import BakersHeader from './BakersHeader';

export default () => {
  const { data, error, loading } = useGetBakersQuery({ pollInterval: 5000 });
  return (
    <VStack alignItems="flex-start">
      <BakersHeader />
      <Divider marginBottom="10px" />
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <HStack shouldWrapChildren wrap="wrap" spacing="0">
        {loading && <Spinner />}
        {data?.bakers.map((baker) => (
          <BakerCard key={baker.address} baker={baker} />
        ))}
      </HStack>
    </VStack>
  );
};
