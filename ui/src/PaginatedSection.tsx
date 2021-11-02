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
import SectionHeader from './SectionHeader';

const getInt = (key: string, defaultValue: string) => {
  return parseInt(localStorage.getItem(key) || defaultValue);
};

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
  query: any;
  getCount: (data: any) => number;
  render: (data: any) => JSX.Element[];
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
  });

  let totalCount = 0;
  let renderedItems = null;
  if (data) {
    totalCount = getCount(data);
    renderedItems = render(data);
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
        {renderedItems}
      </HStack>
    </VStack>
  );
};
