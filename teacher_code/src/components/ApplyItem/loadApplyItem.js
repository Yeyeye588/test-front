import React from 'react';
import { formatVal } from '@/utils/format';
import ApplyItem from './index';

const loadApplyItem = (
  dom,
  operate,
  type = 'text',
  renderValue = (v) => {
    return formatVal(v);
  },
) => {
  if (operate) {
    return dom;
  }
  return <ApplyItem type={type} renderValue={renderValue} />;
};

export default loadApplyItem;
