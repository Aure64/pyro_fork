import React from 'react';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';

const MAX_PAGE_SIZE = 16;

export default ({
  isOpen,
  onClose,
  title,
  initialPageSize,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialPageSize: number;
  onSave: (value: number) => void;
}) => {
  const initialRef = React.useRef<any>();

  const [value, setValue] = React.useState<string>(initialPageSize.toString());

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setValue(value);
  };

  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.code === 'Enter' && isValid()) {
      handleSave();
    }
  };

  const isValid = () => {
    const valueAsNumber = parseInt(value);
    return (
      typeof valueAsNumber === 'number' &&
      valueAsNumber > 0 &&
      valueAsNumber <= MAX_PAGE_SIZE
    );
  };

  const handleSave = () => {
    onSave(parseInt(value));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={initialRef}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>
              Number of items per page ({MAX_PAGE_SIZE} max)
            </FormLabel>
            <Input
              ref={initialRef}
              value={value}
              onChange={onChange}
              onKeyUp={onKeyUp}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              isDisabled={!isValid()}
            >
              Save
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
