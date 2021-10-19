import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Divider,
  Heading,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import React from 'react';
import { useGetNodesQuery } from './api';
import NodeCard from './NodeCard';
import useInterval from './use-interval';

interface AppProps {}

function App({}: AppProps) {
  const { data, error, loading } = useGetNodesQuery({ pollInterval: 5000 });
  const [count, setCount] = React.useState<number>(0);

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  return (
    <Box p="20px">
      <Heading>Nodes</Heading>
      <Divider marginBottom="10px" />
      <HStack shouldWrapChildren wrap="wrap" spacing="0">
        {loading && <Spinner />}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle mr={2}>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        {data?.nodes.map((node) => (
          <NodeCard node={node} />
        ))}
      </HStack>
    </Box>
  );
}

export default App;
