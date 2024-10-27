import React from 'react';
import { Space } from 'antd';
import { useModel } from '@umijs/max';
// import Notice from '@/components/Notice';
import Avatar from './AvatarDropdown';
import styles from './index.less';

const GlobalHeaderRight = () => {
  const { initialState } = useModel('@@initialState');
  if (!initialState || !initialState.settings) {
    return null;
  }
  const { navTheme, layout } = initialState.settings;
  let className = styles.right;
  if ((navTheme === 'realDark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <Space className={className}>
      {/* <Notice /> */}
      <Avatar />
    </Space>
  );
};
export default GlobalHeaderRight;
