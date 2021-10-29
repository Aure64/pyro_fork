import React from 'react';
import { useGetNodesQuery } from './api';
import NodeCard from './NodeCard';
import PaginatedSection from './PaginatedSection';

/* const STORAGE_KEY_OFFSET = 'nodes.offset';
 * const STORAGE_KEY_PAGE_SIZE = 'nodes.pageSize';
 *
 * const getInt = (key: string, defaultValue: string) => {
 *   return parseInt(localStorage.getItem(key) || defaultValue);
 * }; */

export default () => (
  <PaginatedSection
    title="Nodes"
    storageNs="nodes"
    query={useGetNodesQuery}
    renderItems={(data) => {
      return (
        (data &&
          'nodes' in data &&
          data?.nodes.items.map((node) => (
            <NodeCard key={node.url} node={node} />
          ))) ||
        []
      );
    }}
  />
);

/* export const a = () => {
 *   const initialOffset = getInt(STORAGE_KEY_OFFSET, '0');
 *   const initialPageSize = getInt(STORAGE_KEY_PAGE_SIZE, '6');
 *
 *   const [offset, setOffset] = React.useState(initialOffset);
 *   const [pageSize, setPageSize] = React.useState(initialPageSize);
 *
 *   const { data, error, loading } = useGetNodesQuery({
 *     pollInterval: 5000,
 *     variables: { offset, limit: pageSize },
 *   });
 *
 *   const totalCount = data?.nodes.totalCount || 0;
 *
 *   const setAndRefetch = (newOffset: number) => {
 *     setOffset(newOffset);
 *     localStorage.setItem(STORAGE_KEY_OFFSET, newOffset.toString());
 *   };
 *
 *   const setAndSavePageSize = (newSize: number) => {
 *     setPageSize(newSize);
 *     localStorage.setItem(STORAGE_KEY_PAGE_SIZE, newSize.toString());
 *   };
 *
 *   return (
 *     <VStack alignItems="flex-start" w="100%">
 *       <SectionHeader
 *         text="Nodes"
 *         loading={loading}
 *         count={totalCount}
 *         onSettingsClick={() => {}}
 *       />
 *
 *       {error && (
 *         <Alert status="error">
 *           <AlertIcon />
 *           <AlertTitle mr={2}>Error</AlertTitle>
 *           <AlertDescription>{error.message}</AlertDescription>
 *         </Alert>
 *       )}
 *
 *       <Pagination
 *         offset={offset}
 *         pageSize={pageSize}
 *         totalCount={totalCount}
 *         loading={loading}
 *         onChange={setAndRefetch}
 *         onPageSizeChange={setAndSavePageSize}
 *       />
 *
 *       <HStack shouldWrapChildren wrap="wrap" spacing="0">
 *         {loading && <Spinner />}
 *         {data?.nodes.items.map((node) => (
 *           <NodeCard key={node.url} node={node} />
 *         ))}
 *       </HStack>
 *     </VStack>
 *   );
 * }; */
