import { Heading, HStack, IconButton, Spinner, Text } from '@chakra-ui/react';
import React, { MouseEventHandler } from 'react';
import { MdOutlineSettings } from 'react-icons/md';
import { numberFormat } from './format';

export default ({
  text,
  count,
  loading,
  onSettingsClick,
}: {
  text: string;
  count: number | null;
  loading: boolean;
  onSettingsClick: MouseEventHandler;
}) => {
  return (
    <HStack w="100%" justifyContent="space-between">
      <Heading>
        {text}{' '}
        {typeof count === 'number' && (
          <Text as="span" fontSize="x-large">
            ({numberFormat.format(count)})
          </Text>
        )}
      </Heading>
      {loading && <Spinner size="sm" />}
      <IconButton
        aria-label="Settings"
        icon={<MdOutlineSettings />}
        isRound
        onClick={onSettingsClick}
      />
    </HStack>
  );
};
