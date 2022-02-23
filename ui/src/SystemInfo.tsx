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

import { Heading } from '@chakra-ui/react';

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

const Label: React.FC = ({ children }) => (
  <Text fontWeight="bold" as="span" color="#606060">
    {children}
  </Text>
);

const LabeledItem: React.FC<{ label: string }> = ({ label, children }) => (
  <Box>
    <Label>{label}:</Label> {children}
  </Box>
);

const ProcessInfo = ({ cpu, mem, memRss, memVsz, started }: ProcessInfo) => (
  <HStack d="flex" wrap="wrap">
    <LabeledItem label="CPU">{cpu}%</LabeledItem>
    <LabeledItem label="Mem">{mem}%</LabeledItem>
    <LabeledItem label="RSS">{formatMemRss(memRss)}</LabeledItem>
    <LabeledItem label="Virtual">{formatMemVsz(memVsz)}</LabeledItem>
    <LabeledItem label="Since">
      {timestampFormat.format(new Date(started))}
    </LabeledItem>
  </HStack>
);

const OsInfo = ({ distro, hypervizor, release }: OsData) => (
  <LabeledItem label="OS">
    {distro} {release} {hypervizor ? `(virtual)` : ''}
  </LabeledItem>
);

const CpuInfo = ({ cores, manufacturer, brand }: CpuData) => (
  <>
    <LabeledItem label="CPU">
      {manufacturer} {brand}
    </LabeledItem>
    <LabeledItem label="Cores">{cores}</LabeledItem>
  </>
);

const FsItem = ({ use, mount, available, size, used, fs }: FsSizeData) => {
  return (
    <HStack wrap="wrap">
      <Tooltip
        label={`Used ${formatSystemMem(used)} of ${formatSystemMem(size)}`}
      >
        <Box>
          <Progress value={use} minW="120px" />
        </Box>
      </Tooltip>{' '}
      <HStack wrap="wrap">
        <Box>
          <Text fontFamily="mono" minW="5.5rem" w="100%" textAlign="right">
            {formatSystemMem(available)}
          </Text>
        </Box>
        <Tooltip label={`Filesystem: ${fs}`}>
          <Text>{mount}</Text>
        </Tooltip>
      </HStack>
    </HStack>
  );
};

const FsSizeInfo = ({ data }: { data: (FsSizeData | null | undefined)[] }) => (
  <HStack d="flex" wrap="wrap">
    <VStack alignItems="flex-start">
      <Label>Disk:</Label>
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
      <Label>Mem:</Label>{' '}
      <Progress value={(100 * active) / total} minW="120px" />
      <Text fontFamily="mono">
        {formatSystemMem(active)} of {formatSystemMem(total)}
      </Text>
    </Box>
    <Box>
      <Label>Swap:</Label>{' '}
      <Progress value={(100 * swapused) / swaptotal} minW="120px" />
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
      <HStack>
        {data?.sysInfo.osInfo && <OsInfo {...data?.sysInfo.osInfo} />}
        {data?.sysInfo.cpu && <CpuInfo {...data?.sysInfo.cpu} />}
      </HStack>
      {data?.sysInfo.mem && <MemInfo {...data?.sysInfo.mem} />}

      {data?.sysInfo.fsSize && <FsSizeInfo data={data?.sysInfo.fsSize} />}
    </VStack>
  );
};
