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

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
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
  numberFormat,
  formatRelativeTime,
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

const ProcessInfo = ({
  cpu,
  mem,
  memRss,
  memVsz,
  started,
  command,
}: ProcessInfo) => (
  <HStack d="flex" wrap="wrap">
    <LabeledItem label="CPU">{numberFormat.format(cpu)}%</LabeledItem>
    <LabeledItem label="Mem">{numberFormat.format(mem)}%</LabeledItem>
    <LabeledItem label="RSS">{formatMemRss(memRss)}</LabeledItem>
    <LabeledItem label="Virtual">{formatMemVsz(memVsz)}</LabeledItem>
    <LabeledItem label="Since">
      {timestampFormat.format(new Date(started))}
    </LabeledItem>
    <LabeledItem label="Cmd">{command}</LabeledItem>
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
        <Tooltip label={`Available: ${formatSystemMem(available)}`}>
          <Box>
            <Text fontFamily="mono" minW="5.5rem" w="100%" textAlign="right">
              {formatSystemMem(available)}
            </Text>
          </Box>
        </Tooltip>
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
      {data.filter(notEmpty).map((x, index) => (
        <FsItem key={index} {...x} />
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
        text="System"
        loading={loading}
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

      <HStack wrap="wrap">
        <LabeledItem label="Load average">
          {data?.sysInfo.currentLoad.avgLoad}
        </LabeledItem>
        <LabeledItem label="Pyrometer">{data?.pyrometer.version}</LabeledItem>
        {data?.sysInfo.osInfo && <OsInfo {...data?.sysInfo.osInfo} />}
        {data?.sysInfo.cpu && <CpuInfo {...data?.sysInfo.cpu} />}
      </HStack>
      {data?.sysInfo.mem && <MemInfo {...data?.sysInfo.mem} />}
      {data?.sysInfo.fsSize && <FsSizeInfo data={data?.sysInfo.fsSize} />}

      {data?.pyrometer.processes && (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Cmd</Th>
                <Th>PID</Th>
                <Th>CPU%</Th>
                <Th>Mem%</Th>
                <Th>Virt</Th>
                <Th>RSS</Th>
                <Th>Started</Th>
              </Tr>
            </Thead>
            {data.pyrometer.processes.map((x) => (
              <Tr>
                <Tooltip
                  label={`${x.path ? x.path + '/' : ''}${x.command} ${
                    x.params
                  }`}
                >
                  <Td>{x.command}</Td>
                </Tooltip>
                <Td isNumeric>{x.pid}</Td>
                <Td isNumeric>{numberFormat.format(x.cpu)}</Td>
                <Td isNumeric>{numberFormat.format(x.mem)}</Td>
                <Td isNumeric>{formatMemVsz(x.memVsz)}</Td>
                <Td isNumeric>{formatMemRss(x.memRss)}</Td>
                <Tooltip
                  label={`${timestampFormat.format(new Date(x.started))}`}
                >
                  <Td isNumeric>
                    {formatRelativeTime(new Date(x.started).getTime())}
                  </Td>
                </Tooltip>
              </Tr>
              //<ProcessInfo key={x.pid.toString()} {...x} />
            ))}
          </Table>
        </TableContainer>
      )}
    </VStack>
  );
};
