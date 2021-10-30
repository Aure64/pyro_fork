import { VStack } from '@chakra-ui/react';
import React from 'react';
import Bakers from './Bakers';
import Nodes from './Nodes';
import useInterval from './use-interval';

interface AppProps {}

function App({}: AppProps) {
  const [count, setCount] = React.useState<number>(0);

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  return (
    <VStack p="20px" alignItems="flex-start" w="100%">
      <Bakers />
      <Nodes />
    </VStack>
  );
}

export default App;
