import {
  Button,
  ButtonGroup,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import React, { useState } from 'react';
//import FocusLock from 'react-focus-lock';
import {
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
  MdOutlineSkipNext,
  MdOutlineSkipPrevious,
  MdOutlineShortcut,
} from 'react-icons/md';

const ICON_SIZE = 24;

const IconFirst = () => <MdOutlineSkipPrevious size={ICON_SIZE} />;
const IconLast = () => <MdOutlineSkipNext size={ICON_SIZE} />;
const IconNext = () => <MdOutlineChevronRight size={ICON_SIZE} />;
const IconPrev = () => <MdOutlineChevronLeft size={ICON_SIZE} />;

const Form = ({
  firstFieldRef,
  onOk,
  initialValue,
  maxValue,
}: {
  firstFieldRef: React.Ref<HTMLInputElement>;
  onOk: (value: number) => void;
  initialValue: string;
  maxValue: number;
}) => {
  const [value, setValue] = useState<string>(initialValue);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setValue(value);
  };

  const isValid = () => {
    const valueAsNumber = parseInt(value);
    return (
      typeof valueAsNumber === 'number' &&
      valueAsNumber > 0 &&
      valueAsNumber <= maxValue
    );
  };

  const handleOk = () => {
    onOk(parseInt(value));
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.code === 'Enter' && isValid()) {
      handleOk();
    }
  };

  return (
    <HStack spacing={4}>
      <InputGroup size="sm">
        <Input
          ref={firstFieldRef}
          value={value}
          onChange={onChange}
          size="sm"
          onKeyUp={handleKeyUp}
        />
        <InputRightElement>
          <IconButton
            aria-label="Go to page"
            isDisabled={!isValid()}
            onClick={handleOk}
            size="sm"
            icon={<MdOutlineShortcut />}
            variant="link"
          />
        </InputRightElement>
      </InputGroup>
    </HStack>
  );
};

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

  if (pageCount === 1) return null;

  const { onOpen, onClose, isOpen } = useDisclosure();
  const firstFieldRef = React.useRef(null);

  const goToPage = (page: number) => {
    onChange(pageSize * (page - 1));
    onClose();
  };

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
          isDisabled={loading || currentPage <= 1}
          leftIcon={<IconFirst />}
        />
        <Button
          onClick={prev}
          isDisabled={loading || !hasPrev()}
          leftIcon={<IconPrev />}
        />

        <Popover
          isOpen={isOpen}
          initialFocusRef={firstFieldRef}
          onOpen={onOpen}
          onClose={onClose}
          placement="auto"
          closeOnBlur={true}
          matchWidth={false}
          gutter={2}
        >
          <PopoverTrigger>
            <Button isDisabled={loading}>
              <Text fontFamily="mono" pl={5} pr={5}>
                {currentPage}/{pageCount}
              </Text>
            </Button>
          </PopoverTrigger>
          {isOpen && (
            <PopoverContent p={2} w="6rem">
              <PopoverArrow />
              <Form
                firstFieldRef={firstFieldRef}
                initialValue={currentPage.toString()}
                maxValue={pageCount}
                onOk={goToPage}
              />
            </PopoverContent>
          )}
        </Popover>

        <Button
          onClick={next}
          isDisabled={loading || !hasNext()}
          leftIcon={<IconNext />}
        />

        <Button
          onClick={last}
          isDisabled={loading || currentPage > pageCount - 1}
          leftIcon={<IconLast />}
        />
      </ButtonGroup>
    </HStack>
  );
};
