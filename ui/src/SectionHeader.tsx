import { Heading, HStack, IconButton, Spinner, Text } from '@chakra-ui/react';
import React, { MouseEventHandler } from 'react';
import type { IconType } from 'react-icons/lib';
import { numberFormat } from './format';

export default ({
  text,
  secondaryText,
  count,
  loading,
  Icon,
  iconLabel,
  onIconClick,
}: {
  text: string;
  secondaryText?: string;
  count?: number | null;
  loading: boolean;
  Icon: IconType;
  iconLabel: string;
  onIconClick: MouseEventHandler;
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
        {secondaryText && (
          <Text as="span" fontSize="x-large">
            {secondaryText}
          </Text>
        )}
      </Heading>
      {loading && <Spinner size="sm" />}
      <IconButton
        aria-label={iconLabel}
        icon={<Icon />}
        isRound
        onClick={onIconClick}
      />
    </HStack>
  );
};
