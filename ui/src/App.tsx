import { Box, Divider, Heading } from '@chakra-ui/react';
import React from 'react';
import Nodes from './Nodes';
import Bakers from './Bakers';
import useInterval from './use-interval';

interface AppProps {}

function App({}: AppProps) {
  const [count, setCount] = React.useState<number>(0);

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  return (
    <Box p="20px">
      <Heading>Nodes</Heading>
      <Divider marginBottom="10px" />
      <Nodes />
      <Heading>Bakers</Heading>
      <Divider marginBottom="10px" />
      <Bakers />
    </Box>
  );
}

export default App;
