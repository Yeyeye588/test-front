import React, { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { Spin } from 'antd';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { stringify } from 'querystring';
import { rmProjectToken, formatPath } from '@/utils/utils';
import avatarBg from '@/assets/avatar.png';
import { fetchLogout } from '@/services/api';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

const AvatarDropdown = ({ menu }) => {
  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    // await fetchLogout();
    // rmProjectToken();
    localStorage.removeItem('bank-chain-user');
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    /** 此方法会跳转到 redirect 参数所在的位置 */
    const redirect = urlParams.get('redirect');
    if (formatPath(pathname) !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        // search: stringify({
        //   redirect: formatPath(pathname) + search,
        // }),
      });
    }
  };
  const { initialState, setInitialState } = useModel('@@initialState');

  const onMenuClick = useCallback(
    (event) => {
      const { key } = event;
      if (key === 'logout') {
        flushSync(() => {
          setInitialState((s) => ({ ...s, currentUser: undefined }));
        });
        loginOut();
        return;
      }
      if (key === 'center') {
        history.push('/profile');
        return;
      }
      history.push(`/account/${key}`);
    },
    [setInitialState],
  );

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.name) {
    return loading;
  }

  const menuItems = [
    ...(menu
      ? [
          {
            key: 'center',
            icon: <UserOutlined />,
            label: '个人中心',
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '个人设置',
          },
          {
            type: 'divider',
          },
        ]
      : []),
    // {
    //   key: 'center',
    //   icon: <UserOutlined />,
    //   label: '个人中心',
    // },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        items: menuItems,
        onClick: onMenuClick,
        className: styles.menu,
      }}
    >
      <span className={`${styles.action} ${styles.account}`}>
        <img src={avatarBg} alt="avatar" className={styles.avatar} />
        <span className={`${styles.name} anticon`}>{currentUser.name}</span>
      </span>
    </HeaderDropdown>
  );
};

export default AvatarDropdown;
