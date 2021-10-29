import {
  Button,
  ButtonGroup,
  HStack,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Stack,
  InputProps,
} from '@chakra-ui/react';
import React, { MouseEventHandler, useState } from 'react';
//import FocusLock from 'react-focus-lock';
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

// 1. Create a text input component
const TextInput = React.forwardRef<
  HTMLInputElement,
  { label: string } & InputProps
>((props, ref) => {
  return (
    <FormControl>
      <FormLabel htmlFor={props.id}>{props.label}</FormLabel>
      <Input ref={ref} {...props} />
    </FormControl>
  );
});

// 2. Create the form
const Form = ({
  firstFieldRef,
  onCancel,
  onOk,
  initialValue,
}: {
  firstFieldRef: React.Ref<HTMLInputElement>;
  onCancel: MouseEventHandler;
  onOk: (value: number) => void;
  initialValue: string;
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
      valueAsNumber <= 12
    );
  };

  const handleOk = () => {
    onOk(parseInt(value));
  };

  return (
    <Stack spacing={4}>
      <TextInput
        label="Items per page (max 12)"
        id="first-name"
        ref={firstFieldRef}
        value={value}
        onChange={onChange}
      />
      <ButtonGroup d="flex" justifyContent="flex-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button isDisabled={!isValid()} colorScheme="teal" onClick={handleOk}>
          Ok
        </Button>
      </ButtonGroup>
    </Stack>
  );
};

export default ({
  offset,
  pageSize,
  totalCount,
  loading,
  onChange,
  onPageSizeChange,
}: {
  offset: number;
  pageSize: number;
  totalCount: number;
  loading: boolean;
  onChange: (newOffset: number) => void;
  onPageSizeChange: (newSize: number) => void;
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

  const handlePageSizeChange = (newSize: number) => {
    onPageSizeChange(newSize);
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
          disabled={loading || currentPage <= 1}
          leftIcon={<IconFirst />}
        />
        <Button
          onClick={prev}
          disabled={loading || !hasPrev()}
          leftIcon={<IconPrev />}
        />

        <Popover
          isOpen={isOpen}
          initialFocusRef={firstFieldRef}
          onOpen={onOpen}
          onClose={onClose}
          placement="right"
          closeOnBlur={false}
        >
          <PopoverTrigger>
            <Button disabled={loading}>
              <Text fontFamily="mono" pl={5} pr={5}>
                {currentPage}/{pageCount}
              </Text>
            </Button>
          </PopoverTrigger>
          <PopoverContent p={5}>
            <PopoverArrow />
            <PopoverCloseButton />
            <Form
              firstFieldRef={firstFieldRef}
              onCancel={onClose}
              initialValue={pageSize.toString()}
              onOk={handlePageSizeChange}
            />
          </PopoverContent>
        </Popover>

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
