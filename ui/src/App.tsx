import { VStack, Divider, Heading } from '@chakra-ui/react';
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
    <VStack p="20px" alignItems="flex-start">
      <Bakers />
      <Heading>Nodes</Heading>
      <Divider marginBottom="10px" />
      <Nodes />
    </VStack>
  );
}

export default App;
