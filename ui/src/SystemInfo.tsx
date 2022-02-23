import {
  VStack,
  HStack,
  Text,
  Tooltip,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import React from 'react';
import {
  useGetSystemInfoQuery,
  ProcessInfo,
  OsData,
  CpuData,
  MemData,
  FsSizeData,
} from './api';

import SectionHeader from './SectionHeader';
import { Progress } from '@chakra-ui/react';

import notEmpty from './not-empty';

import { Heading, IconButton, Spinner } from '@chakra-ui/react';

import { FaGitlab } from 'react-icons/fa';
import {
  timestampFormat,
  formatMemRss,
  formatMemVsz,
  formatSystemMem,
} from './format';

const onIconClick = () => {
  window.open('https://gitlab.com/tezos-kiln/pyrometer', '_blank');
};

const ProcessInfo = ({ cpu, mem, memRss, memVsz, started }: ProcessInfo) => (
  <HStack d="flex" wrap="wrap">
    <Box>CPU: {cpu}%</Box>
    <Box>Mem: {mem}%</Box>
    <Box>RSS: {formatMemRss(memRss)}</Box>
    <Box>Virtual: {formatMemVsz(memVsz)}</Box>
    <Box>Since: {timestampFormat.format(new Date(started))}</Box>
  </HStack>
);

const OsInfo = ({ arch, codename, distro, hypervizor, release }: OsData) => (
  <HStack d="flex" wrap="wrap">
    <Box>
      OS: {distro} {release} ({codename}) {arch} {hypervizor}
    </Box>
  </HStack>
);

const CpuInfo = ({ cores, efficiencyCores, manufacturer, brand }: CpuData) => (
  <HStack d="flex" wrap="wrap">
    <Box>
      CPU: {manufacturer} {brand} {cores}/{efficiencyCores} cores
    </Box>
  </HStack>
);

const FsItem = ({ use, mount, available, fs }: FsSizeData) => {
  return (
    <HStack wrap="wrap">
      <Progress value={use} minW="120px" />{' '}
      <HStack wrap="wrap">
        <Box>
          <Text fontFamily="mono" minW="5rem" w="100%" textAlign="right">
            {formatSystemMem(available)}
          </Text>
        </Box>
        <Text>{mount}</Text>
      </HStack>
    </HStack>
  );
};

const FsSizeInfo = ({ data }: { data: (FsSizeData | null | undefined)[] }) => (
  <HStack d="flex" wrap="wrap">
    <VStack alignItems="flex-start">
      {data.filter(notEmpty).map((x) => (
        <FsItem {...x} />
      ))}
    </VStack>
  </HStack>
);

const MemInfo = ({
  total,
  active,
  swaptotal,
  swapused,
}: Omit<MemData, 'used'>) => (
  <HStack d="flex" wrap="wrap" spacing={5}>
    <Box>
      Mem: <Progress value={(100 * active) / total} minW="120px" />
      <Text fontFamily="mono">
        {formatSystemMem(active)} of {formatSystemMem(total)}
      </Text>
    </Box>
    <Box>
      Swap: <Progress value={(100 * swapused) / swaptotal} minW="120px" />
      <Text fontFamily="mono">
        {formatSystemMem(swapused)} of {formatSystemMem(swaptotal)}
      </Text>
    </Box>
  </HStack>
);

export default () => {
  const { data, error, loading } = useGetSystemInfoQuery({
    pollInterval: 15e3,
  });

  return (
    <VStack
      spacing={2}
      justifyContent="space-between"
      w="100%"
      alignItems="baseline"
      flexWrap="wrap"
    >
      <SectionHeader
        text="Pyrometer"
        loading={loading}
        secondaryText={data?.pyrometer.version}
        iconLabel="Pyrometer project on Gitlab"
        Icon={FaGitlab}
        onIconClick={onIconClick}
      />

      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Heading size="md">Process</Heading>
      {data?.pyrometer.process && <ProcessInfo {...data?.pyrometer.process} />}
      <Heading size="md">System</Heading>
      <Box>Avg. Load: {data?.sysInfo.currentLoad.avgLoad}</Box>
      {data?.sysInfo.osInfo && <OsInfo {...data?.sysInfo.osInfo} />}
      {data?.sysInfo.cpu && <CpuInfo {...data?.sysInfo.cpu} />}
      {data?.sysInfo.mem && <MemInfo {...data?.sysInfo.mem} />}
      {data?.sysInfo.fsSize && <FsSizeInfo data={data?.sysInfo.fsSize} />}
    </VStack>
  );
};
