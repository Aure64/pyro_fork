import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import React from 'react';
import { useGetBakersQuery } from './api';
import BakerCard from './BakerCard';

export default () => {
  const { data, error, loading } = useGetBakersQuery({ pollInterval: 5000 });
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
      {data?.bakers.map((baker) => (
        <BakerCard baker={baker} />
      ))}
    </HStack>
  );
};
