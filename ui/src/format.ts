export const relativeTimeFormat = new Intl.RelativeTimeFormat([], {
  style: 'short',
});

export const timestampFormat = new Intl.DateTimeFormat([], {
  dateStyle: 'short',
  timeStyle: 'short',
});

export const takeStart = (str: string | undefined | null, length = 5) => {
  return str && `${str.substr(0, length)}`;
};

export const ellipsifyMiddle = (str: string | undefined | null) => {
  return str && `${takeStart(str)}..${str.substr(-4)}`;
};
