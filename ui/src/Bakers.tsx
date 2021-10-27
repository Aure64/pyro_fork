import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  HStack,
  Spinner,
  VStack,
  Divider,
  Button,
  ButtonGroup,
  Text,
} from '@chakra-ui/react';

import {
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
  MdOutlineSkipNext,
  MdOutlineSkipPrevious,
} from 'react-icons/md';

import React from 'react';
import { useGetBakersQuery } from './api';
import BakerCard from './BakerCard';
import BakersHeader from './BakersHeader';

export default () => {
  const pageSize = 6;
  const [offset, setOffset] = React.useState(0);

  const { data, error, loading, refetch } = useGetBakersQuery({
    pollInterval: 5000,
    variables: { offset: 0, limit: pageSize },
  });

  const totalCount = data?.bakers.totalCount || 0;

  const pageCount = Math.ceil(totalCount / pageSize);
  const currentPage = Math.ceil(offset / pageSize) + 1;

  const canGoBack = () => offset - pageSize >= 0;
  const canGoForward = () => offset + pageSize < totalCount;

  const setAndRefetch = (newOffset: number) => {
    setOffset(newOffset);
    refetch({ offset: newOffset });
  };

  const back = () => setAndRefetch(offset - pageSize);
  const forward = () => setAndRefetch(offset + pageSize);
  const first = () => setAndRefetch(0);
  const last = () => setAndRefetch(pageSize * (pageCount - 1));

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
      <HStack w="100%" justifyContent="flex-end">
        <ButtonGroup
          variant="outline"
          spacing="2"
          size="sm"
          alignItems="center"
        >
          <Button
            onClick={first}
            disabled={loading || currentPage <= 1}
            leftIcon={<MdOutlineSkipPrevious size={24} />}
          />
          <Button
            onClick={back}
            disabled={loading || !canGoBack()}
            leftIcon={<MdOutlineChevronLeft size={24} />}
          />
          <Text fontFamily="mono">
            {currentPage}/{pageCount}
          </Text>

          <Button
            onClick={forward}
            disabled={loading || !canGoForward()}
            leftIcon={<MdOutlineChevronRight size={24} />}
          />

          <Button
            onClick={last}
            disabled={loading || currentPage >= pageCount - 1}
            leftIcon={<MdOutlineSkipNext size={24} />}
          />
        </ButtonGroup>
      </HStack>
      <HStack shouldWrapChildren wrap="wrap" spacing="0">
        {loading && <Spinner />}
        {data?.bakers.items.map((baker) => (
          <BakerCard key={baker.address} baker={baker} />
        ))}
      </HStack>
    </VStack>
  );
};
