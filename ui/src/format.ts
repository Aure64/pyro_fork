export const relativeTimeFormat = new Intl.RelativeTimeFormat([], {
  style: 'short',
});

export const timestampFormat = new Intl.DateTimeFormat([], {
  dateStyle: 'short',
  timeStyle: 'short',
});

const S_SECOND = 1e3;
const S_MINUTE = 60 * S_SECOND;
const S_HOUR = 60 * S_MINUTE;
const S_DAY = 24 * S_HOUR;

export const formatRelativeTime = (
  t: number,
  now: number = Date.now(),
): string => {
  if (isNaN(t)) {
    return '?';
  }
  const dtMillis = t - now;
  const dtMillisAbs = Math.abs(dtMillis);
  let dt, unit;
  if (dtMillisAbs > 2 * S_DAY) {
    dt = Math.round(dtMillis / S_DAY);
    unit = 'day' as Intl.RelativeTimeFormatUnit;
  } else if (dtMillisAbs > 2 * S_HOUR) {
    dt = Math.round(dtMillis / S_HOUR);
    unit = 'hour' as Intl.RelativeTimeFormatUnit;
  } else if (dtMillisAbs > 2 * S_MINUTE) {
    dt = Math.round(dtMillis / S_MINUTE);
    unit = 'minute' as Intl.RelativeTimeFormatUnit;
  } else {
    dt = Math.round(dtMillis / S_SECOND);
    unit = 'second' as Intl.RelativeTimeFormatUnit;
  }
  return relativeTimeFormat.format(dt, unit);
};

export const takeStart = (str: string | undefined | null, length = 5) => {
  return str && `${str.substr(0, length)}`;
};

export const ellipsifyMiddle = (
  str: string | undefined | null,
  startLength = 5,
) => {
  return str && `${takeStart(str, startLength)}..${str.substr(-4)}`;
};

export const numberFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});

export const numberFormat0 = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export const formatMutezAsTez = (mutez: string | undefined | null) => {
  if (!mutez) return '';
  const value = BigInt(mutez) / 1000000n;
  return `${numberFormat.format(value)} ꜩ`;
};

export const formatMemRss = (kbytes: number | undefined | null): string => {
  if (!kbytes) return '';
  return `${numberFormat0.format(kbytes / 1024)}M`;
};

const Kb = 1024;
const Mb = 1024 * Kb;
const Gb = 1024 * Mb;

export const formatSystemMem = (bytes: number | undefined | null): string => {
  if (!bytes) return '';
  const mbytes = bytes / Mb;
  if (mbytes < 1024) {
    return `${numberFormat0.format(mbytes)}M`;
  }
  return `${numberFormat0.format(bytes / Gb)}G`;
};

export const formatMemVsz = (kbytes: number | undefined | null): string => {
  if (!kbytes) return '';
  const mbytes = kbytes / Kb;
  if (mbytes < 1024) {
    return `${numberFormat0.format(mbytes)}M`;
  }
  return `${numberFormat0.format(mbytes / 1024)}G`;
};
