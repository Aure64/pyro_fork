import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  HStack,
  Spinner,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import React, { ReactElement } from 'react';
import PageSizeDialog from './PageSizeDialog';
import Pagination from './Pagination';
import SectionHeader from './SectionHeaderWithSettings';

const getInt = (key: string, defaultValue: string) => {
  return parseInt(localStorage.getItem(key) || defaultValue);
};

import type { useGetBakersQuery, useGetNodesQuery } from './api';
import type { GraphQLErrors } from '@apollo/client/errors';

export default ({
  title,
  storageNs,
  query,
  renderSubHeader,
  getCount,
  render,
}: {
  title: string;
  storageNs: string;
  query: typeof useGetBakersQuery | typeof useGetNodesQuery;
  getCount: (data: any) => number;
  render: (data: any, errors?: GraphQLErrors) => JSX.Element[];
  renderSubHeader?: () => ReactElement;
}) => {
  const storageKeyOffset = `${storageNs}.offset`;
  const storageKeyPageSize = `${storageNs}.pageSize`;

  const {
    isOpen: isSettingsOpened,
    onOpen: settingsOpen,
    onClose: settingsClose,
  } = useDisclosure();

  const initialOffset = getInt(storageKeyOffset, '0');
  const initialPageSize = getInt(storageKeyPageSize, '6');

  const [offset, setOffset] = React.useState(initialOffset);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const { data, error, loading } = query({
    pollInterval: 15e3,
    variables: { offset, limit: pageSize },
    errorPolicy: 'all',
  });

  let totalCount = 0;
  let renderedItems = null;
  if (data) {
    totalCount = getCount(data);
    renderedItems = render(data, error?.graphQLErrors);
  }

  const setAndSaveOffset = (newOffset: number) => {
    setOffset(newOffset);
    localStorage.setItem(storageKeyOffset, newOffset.toString());
  };

  const setAndSavePageSize = (newSize: number) => {
    setAndSaveOffset(0);
    setPageSize(newSize);
    localStorage.setItem(storageKeyPageSize, newSize.toString());
  };

  const handlePageSizeSave = (newSize: number) => {
    setAndSavePageSize(newSize);
    settingsClose();
  };

  return (
    <VStack alignItems="flex-start" w="100%">
      {totalCount > 0 && (
        <SectionHeader
          text={title}
          loading={loading}
          count={totalCount}
          onIconClick={settingsOpen}
        />
      )}
      {renderSubHeader && renderSubHeader()}
      {error && error.networkError && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Network Error</AlertTitle>
          <AlertDescription>{error.networkError.message}</AlertDescription>
        </Alert>
      )}
      {error &&
        error.graphQLErrors.length > 0 &&
        error.graphQLErrors
          .filter((error) => !error.extensions)
          .map((error, index) => (
            <Alert key={`${index}`} status="error">
              <AlertIcon />
              <AlertTitle mr={2}>Error</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ))}

      {/* make sure component is unmounted when not visible, we don't want to keep it's state */}
      {isSettingsOpened && (
        <PageSizeDialog
          isOpen={isSettingsOpened}
          onClose={settingsClose}
          title={title}
          initialPageSize={pageSize}
          onSave={handlePageSizeSave}
        />
      )}

      {pageSize <= totalCount && (
        <Pagination
          offset={offset}
          pageSize={pageSize}
          totalCount={totalCount}
          loading={loading}
          onChange={setAndSaveOffset}
        />
      )}

      <HStack shouldWrapChildren wrap="wrap" spacing="0">
        {loading && <Spinner />}
        {renderedItems}
      </HStack>
    </VStack>
  );
};
