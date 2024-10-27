/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { ConfigProvider, Tabs, Modal, Dropdown, Menu } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import { InfoCircleFilled } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { useMemoizedFn } from 'ahooks';
import { usePageProps, usePrevious } from '@/utils/hooks';
import { isEmptyArray, getPathRouteProps, uniqueFunc } from '@/utils/utils';
import styles from './index.less';

const RIGHT_MENU_CONFIG = {
  CURRENT: {
    code: 'CURRENT',
    desc: '关闭标签页',
  },
  OTHER: {
    code: 'OTHER',
    desc: '关闭其他标签页',
  },
  RIGHT: {
    code: 'RIGHT',
    desc: '关闭右侧标签页',
  },
};

const SwitchTabs = React.memo(({ menuData = [] }) => {
  const tabTitles = {};
  const tabContents = {};
  const allMenuObj = {};

  const getTabObj = useMemoizedFn((arr = [], parent = {}) => {
    arr.forEach((item) => {
      tabContents[item.id] = item.element;

      if (!tabTitles[item.id]) {
        tabTitles[item.id] = item?.name || parent?.name;
      }

      if (item?.path && !allMenuObj[item?.path]) {
        allMenuObj[item?.path] = item;
      }

      if (!isEmptyArray(item?.children)) {
        getTabObj(item.children, item);
      }
    });
  });
  getTabObj(menuData);

  const { initialState } = useModel('@@initialState');
  const { location } = usePageProps();

  const [activeTab, setActiveTab] = useState();
  const oldTab = usePrevious(activeTab);
  const [tabItems, setTabItems] = useState(
    JSON.parse(sessionStorage.getItem(`${PROJECT_KEY}-tabPages`) || '[]'),
  );

  const getCurrTab = (newActiveTab) => tabItems.find((item) => item.id === newActiveTab);

  // 切换 Tab
  const switchTab = useMemoizedFn((newActiveTab) => {
    const currTab = getCurrTab(newActiveTab);
    if (currTab) {
      history.push(currTab.pathname);
      setActiveTab(newActiveTab);
    }
  });

  // 移除 Tab
  const removeTab = useMemoizedFn((tabKey) => {
    let newActiveTab = activeTab;
    let lastIndex = -1;
    tabItems.forEach((item, i) => {
      if (item.id === tabKey) {
        lastIndex = i - 1;
      }
    });
    const newTabItems = tabItems.filter((item) => item.id !== tabKey);
    if (!isEmptyArray(newTabItems) && newActiveTab === tabKey) {
      if (lastIndex >= 0) {
        newActiveTab = newTabItems[lastIndex].id;
      } else {
        newActiveTab = newTabItems[0].id;
      }
    }
    setTabItems(newTabItems);
    switchTab(newActiveTab);
  });

  // 关闭其他tab页
  const removeOtherTabs = useMemoizedFn((tabKey) => {
    const newTabItems = tabItems.filter(
      (item) => item.id === tabKey || String(item?.tabProps?.closable) === 'false',
    );

    setTabItems(newTabItems);
    switchTab(tabKey);
  });

  // 关闭右侧tab页
  const removeRightTabs = useMemoizedFn((tabKey) => {
    const prevTabs = [...tabItems];
    const findIndex = tabItems?.findIndex((item) => item?.id === tabKey);
    const newTabs = prevTabs.slice(0, findIndex + 1);

    setTabItems(
      newTabs.concat(prevTabs?.filter((item) => String(item?.tabProps?.closable) === 'false')),
    );
    switchTab(tabKey);
  });

  // 激活 Tab
  const activateTab = useMemoizedFn(() => {
    const pathRouteProps = getPathRouteProps(
      location.pathname,
      Object.keys(allMenuObj)
        ?.map((key) => allMenuObj[key])
        ?.filter((item) => !item?.path?.includes('*')),
    );

    const currTab = tabItems.find((item) => item.id === pathRouteProps?.id);
    if (currTab) {
      setActiveTab(currTab.id);
    }
  });

  // 任何 Tab 变动，激活正确的 Tab，并更新缓存
  useEffect(() => {
    activateTab();
    sessionStorage.setItem(`${PROJECT_KEY}-tabPages`, JSON.stringify(tabItems));
  }, [tabItems]);

  // 拦截判断是否离开当前页面
  const beforeunload = (e) => {
    let confirmationMessage = '请注意，刷新页签将丢失您当前输入的内容，是否继续？';
    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
  };

  useEffect(() => {
    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  useEffect(() => {
    if (location.pathname && initialState?.settings?.multipleTabs) {
      const { pathname, search } = location;

      const pathRouteProps = getPathRouteProps(
        location.pathname,
        Object.keys(allMenuObj)
          ?.map((key) => allMenuObj[key])
          ?.filter((item) => !item?.path?.includes('*')),
      );

      // 刷新前提示
      if (pathRouteProps?.tabProps?.closeTip) {
        window.onbeforeunload = beforeunload;
      } else {
        window.onbeforeunload = null;
      }

      const currTabItem = {
        id: pathRouteProps?.id,
        title: tabTitles[pathRouteProps?.id],
        pathname: pathname + search,
        tabProps: pathRouteProps?.tabProps,
        scrollTop: 0,
      };

      const oldTabItems = [...tabItems];

      // 防止开启两个首页tab
      if (pathname !== '/') {
        setTabItems((prev) => {
          let next = [...prev];

          const preIndex = prev.findIndex((item) => {
            const prePathname = item?.pathname?.split('?')?.[0];
            return pathname.includes(prePathname) || prePathname.includes(pathname);
          });
          const currIndex = prev.findIndex((item) => item.id === activeTab);

          const lastIndex = prev.findIndex((item) => item.id === oldTab);

          // 保存/更新上一页的滚动位置
          if (lastIndex !== -1) {
            next[lastIndex].scrollTop = document.documentElement.scrollTop;
          }

          if (
            preIndex !== -1 ||
            (currIndex !== -1 && String(currTabItem?.tabProps?.openNew) === 'false') ||
            String(next[lastIndex]?.tabProps?.skipNew) === 'false'
          ) {
            // 当要替换的tab页路径与当前路径相同时，更新scrollTop
            if (next[preIndex !== -1 ? preIndex : currIndex].pathname === currTabItem.pathname) {
              currTabItem.scrollTop = next[preIndex !== -1 ? preIndex : currIndex]?.scrollTop || 0;
            }
            next[preIndex !== -1 ? preIndex : currIndex] = currTabItem;
          } else {
            const findIndex = prev.findIndex((item) => item.id === pathRouteProps?.id);
            if (findIndex !== -1) {
              // 当要替换的tab页路径与当前路径相同时，更新scrollTop
              if (next[findIndex].pathname === currTabItem.pathname) {
                currTabItem.scrollTop = next[findIndex]?.scrollTop || 0;
              }
              next[findIndex] = currTabItem;
            } else {
              next = [...prev, currTabItem];
            }
          }

          return uniqueFunc(next, 'id');
        });
      } else {
        history.push('/profile');
      }

      const currTab = oldTabItems?.find((item) => item.pathname === currTabItem.pathname);
      setTimeout(() => {
        document.documentElement.scrollTop = currTab?.scrollTop || 0;
        activateTab();
      }, 200);
    }
  }, [location.pathname, location.search]);

  const handleTabsMenuClick = useMemoizedFn((tabKey) => (event) => {
    const { key, domEvent } = event;
    domEvent.stopPropagation();

    switch (key) {
      case RIGHT_MENU_CONFIG.CURRENT.code:
        removeTab(tabKey);
        break;
      case RIGHT_MENU_CONFIG.OTHER.code:
        removeOtherTabs(tabKey);
        break;
      case RIGHT_MENU_CONFIG.RIGHT.code:
        removeRightTabs(tabKey);
        break;
    }
  });

  const setMenu = useMemoizedFn((key, index) => {
    const currTab = getCurrTab(key);

    return (
      <Menu onClick={handleTabsMenuClick(key)}>
        <Menu.Item
          disabled={tabItems.length === 1 || String(currTab?.tabProps?.closable) === 'false'}
          key={RIGHT_MENU_CONFIG.CURRENT.code}
        >
          {RIGHT_MENU_CONFIG.CURRENT.desc}
        </Menu.Item>
        <Menu.Item disabled={tabItems.length === 1} key={RIGHT_MENU_CONFIG.OTHER.code}>
          {RIGHT_MENU_CONFIG.OTHER.desc}
        </Menu.Item>
        <Menu.Item disabled={tabItems.length === index + 1} key={RIGHT_MENU_CONFIG.RIGHT.code}>
          {RIGHT_MENU_CONFIG.RIGHT.desc}
        </Menu.Item>
      </Menu>
    );
  });

  const setTab = useMemoizedFn((tab, key, index) => (
    <span onContextMenu={(event) => event.preventDefault()}>
      <Dropdown overlay={setMenu(key, index)} trigger={['contextMenu']}>
        <span className={styles.tabTitle}>{tab}</span>
      </Dropdown>
    </span>
  ));

  return (
    <div className={styles.multipleTabs}>
      <Tabs
        type="editable-card"
        hideAdd
        onChange={switchTab}
        activeKey={activeTab}
        onEdit={(tabKey) => {
          const currTab = getCurrTab(tabKey);
          if (currTab?.tabProps?.closeTip) {
            Modal.confirm({
              title: '请注意，关闭页签将丢失您当前输入的内容，是否继续？',
              okText: '确定',
              cancelText: '取消',
              icon: <InfoCircleFilled />,
              onOk: () => {
                removeTab(tabKey);
              },
            });
          } else {
            removeTab(tabKey);
          }
        }}
        items={tabItems?.map((item, index) => ({
          label: setTab(item?.title || '', item.id, index),
          key: item?.id,
          closable: tabItems?.length > 1 && String(item?.tabProps?.closable) !== 'false',
          children: (
            <ConfigProvider
              input={{ autoComplete: 'off', placeholder: '请输入' }}
              select={{ allowclear: true, placeholder: '请选择' }}
              locale={zhCN}
            >
              {tabContents[item?.id]}
            </ConfigProvider>
          ), // 替换原来直接输出的 children
        }))}
        tabBarStyle={{
          position: 'sticky',
          top: 64,
          zIndex: 99,
          background: '#f3f5fa',
          padding: '10px 0 0 10px',
        }}
      />
    </div>
  );
});

export default SwitchTabs;
