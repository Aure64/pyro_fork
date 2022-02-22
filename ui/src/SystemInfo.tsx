import { VStack, HStack, Text, Tooltip, Box } from '@chakra-ui/react';
import React from 'react';
import {
  useGetSystemInfoQuery,
  ProcessInfo,
  OsData,
  CpuData,
  MemData,
} from './api';

import SectionHeader from './SectionHeader';
import { Progress } from '@chakra-ui/react';

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

const MemInfo = ({
  total,
  active,
  swaptotal,
  swapused,
}: Omit<MemData, 'used'>) => (
  <HStack d="flex" wrap="wrap" spacing={5}>
    <Box>
      Mem: <Progress value={(100 * active) / total} minW="120px" />
      {formatSystemMem(active)} of {formatSystemMem(total)}
    </Box>
    <Box>
      Swap: <Progress value={(100 * swapused) / swaptotal} minW="120px" />
      {formatSystemMem(swapused)} of {formatSystemMem(swaptotal)}
    </Box>
  </HStack>
);

export default () => {
  const { data, loading } = useGetSystemInfoQuery({
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
      <Heading size="md">Process</Heading>
      {data?.pyrometer.process && <ProcessInfo {...data?.pyrometer.process} />}
      <Heading size="md">System</Heading>
      {data?.sysInfo.osInfo && <OsInfo {...data?.sysInfo.osInfo} />}
      {data?.sysInfo.cpu && <CpuInfo {...data?.sysInfo.cpu} />}
      {data?.sysInfo.mem && <MemInfo {...data?.sysInfo.mem} />}
    </VStack>
  );
};
