import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  HStack,
  Spinner,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import React, { ReactElement } from 'react';
import type {
  useGetBakersQuery,
  useGetNodesQuery,
  GetBakersQuery,
  GetNodesQuery,
} from './api';
import SectionHeader from './SectionHeader';
import Pagination from './Pagination';
import PageSizeDialog from './PageSizeDialog';

const getInt = (key: string, defaultValue: string) => {
  return parseInt(localStorage.getItem(key) || defaultValue);
};

export default ({
  title,
  storageNs,
  query,
  renderItems,
  renderSubHeader,
}: {
  title: string;
  storageNs: string;
  query: typeof useGetBakersQuery | typeof useGetNodesQuery;
  renderItems: (
    data: GetNodesQuery | GetBakersQuery | undefined,
  ) => ReactElement[];
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
    pollInterval: 5000,
    variables: { offset, limit: pageSize },
  });

  let totalCount = 0;
  if (data) {
    if ('bakers' in data) totalCount = data.bakers.totalCount;
    if ('nodes' in data) totalCount = data.nodes.totalCount;
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
      <SectionHeader
        text={title}
        loading={loading}
        count={totalCount}
        onSettingsClick={settingsOpen}
      />
      {renderSubHeader && renderSubHeader()}
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

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
        {renderItems(data)}
      </HStack>
    </VStack>
  );
};
