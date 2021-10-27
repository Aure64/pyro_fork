import { Button, ButtonGroup, HStack, Text } from '@chakra-ui/react';
import React from 'react';
import {
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
  MdOutlineSkipNext,
  MdOutlineSkipPrevious,
} from 'react-icons/md';

const ICON_SIZE = 24;

const IconFirst = () => <MdOutlineSkipPrevious size={ICON_SIZE} />;
const IconLast = () => <MdOutlineSkipNext size={ICON_SIZE} />;
const IconNext = () => <MdOutlineChevronRight size={ICON_SIZE} />;
const IconPrev = () => <MdOutlineChevronLeft size={ICON_SIZE} />;

export default ({
  offset,
  pageSize,
  totalCount,
  loading,
  onChange,
}: {
  offset: number;
  pageSize: number;
  totalCount: number;
  loading: boolean;
  onChange: (newOffset: number) => void;
}) => {
  const pageCount = Math.ceil(totalCount / pageSize);
  const currentPage = Math.ceil(offset / pageSize) + 1;

  const hasPrev = () => offset - pageSize >= 0;
  const hasNext = () => offset + pageSize < totalCount;

  const prev = () => onChange(offset - pageSize);
  const next = () => onChange(offset + pageSize);
  const first = () => onChange(0);
  const last = () => onChange(pageSize * (pageCount - 1));

  return (
    <HStack w="100%" justifyContent="flex-end">
      <ButtonGroup
        variant="outline"
        spacing="2"
        size="sm"
        alignItems="center"
        isAttached
      >
        <Button
          onClick={first}
          disabled={loading || currentPage <= 1}
          leftIcon={<IconFirst />}
        />
        <Button
          onClick={prev}
          disabled={loading || !hasPrev()}
          leftIcon={<IconPrev />}
        />
        <Text fontFamily="mono" pl={5} pr={5}>
          {currentPage}/{pageCount}
        </Text>

        <Button
          onClick={next}
          disabled={loading || !hasNext()}
          leftIcon={<IconNext />}
        />

        <Button
          onClick={last}
          disabled={loading || currentPage >= pageCount - 1}
          leftIcon={<IconLast />}
        />
      </ButtonGroup>
    </HStack>
  );
};
