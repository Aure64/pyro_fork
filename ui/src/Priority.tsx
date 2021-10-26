import { Text, Tooltip } from '@chakra-ui/react';
import React from 'react';

const priorityColors: { [key: number]: string } = {
  '0': 'green.600',
  '1': 'yellow.400',
  '2': 'orange.400',
};

const color = (priority: number) => priorityColors[priority] || 'red.500';

export default ({ priority }: { priority: number }) => (
  <Tooltip label={`Priority: ${priority}`}>
    <Text color={color(priority)} as="span">
      {priority}
    </Text>
  </Tooltip>
);