import { VStack } from '@chakra-ui/react';
import React from 'react';
import SystemInfo from './SystemInfo';
import Bakers from './Bakers';
import Nodes from './Nodes';
import useInterval from './use-interval';
import { useSettingsQuery } from './api';

interface AppProps {}

function App({}: AppProps) {
  const [count, setCount] = React.useState<number>(0);

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  const { data } = useSettingsQuery();

  return (
    <VStack p="20px" alignItems="flex-start" w="100%">
      <Bakers />
      <Nodes />
      {data?.settings.showSystemInfo && <SystemInfo />}
    </VStack>
  );
}

export default App;
