import React, { MouseEventHandler } from 'react';
import { MdOutlineSettings } from 'react-icons/md';

import SectionHeader from './SectionHeader';

export default ({
  text,
  count,
  loading,
  onIconClick,
}: {
  text: string;
  count: number | null;
  loading: boolean;
  onIconClick: MouseEventHandler;
}) => {
  return (
    <SectionHeader
      text={text}
      count={count}
      loading={loading}
      onIconClick={onIconClick}
      Icon={MdOutlineSettings}
      iconLabel="Settings"
    />
  );
};
