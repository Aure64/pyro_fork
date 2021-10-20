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

export const ellipsifyMiddle = (str: string | undefined | null) => {
  return str && `${takeStart(str)}..${str.substr(-4)}`;
};
