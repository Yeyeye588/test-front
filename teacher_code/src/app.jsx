import React from 'react';
import { ConfigProvider, Tabs, Popover } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import { StyleProvider, legacyLogicalPropertiesTransformer } from '@ant-design/cssinjs';
import * as Icon from '@ant-design/icons';
import { RouteContext } from '@ant-design/pro-components';
import { history, Link } from '@umijs/max';
import 'moment/locale/zh-cn';
import { stringify } from 'qs';
import RightContent from '@/components/RightContent';
import SwitchTabs from '@/components/SwitchTabs';
import { usePageProps } from '@/utils/hooks';
import { defaultKeys } from '@/utils/menu';
import { formatPath, isEmptyArray } from '@/utils/utils';
import Logo from '@/assets/logo-title.svg';
import { fetchProfile } from '@/services/api';
import defaultSettings from '../config/defaultSettings';
import { getBrowserInfo } from './broswer';
import { errorConfig } from './requestErrorConfig';

// const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
const skipAuthPaths = ['/user/login', '/user/register'];

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState() {
  // const fetchUserInfo = async () => {
  //   try {
  //     const msg = await fetchProfile({
  //       skipErrorHandler: true, // 跳过默认的错误处理
  //     });
  //     const info = msg.data;
  //     info.hasRoutesKeys = info?.menuData || defaultKeys;
  //     return info;
  //   } catch (error) {
  //     history.push(loginPath);
  //   }
  //   return undefined;
  // };
  const { pathname } = window.location;

  // 如果不是登录和注册页面，执行
  if (!skipAuthPaths.includes(formatPath(pathname))) {
    const user = localStorage.getItem('bank-chain-user');
    if (!user) {
      history.push(loginPath);
      return {
        settings: defaultSettings,
      };
    }
    return {
      currentUser: JSON.parse(user),
      settings: defaultSettings,
    };
  }
  return {
    settings: defaultSettings,
  };
}

const handleTargetJump = (path, target) => {
  window.open(path, target);
};

const IconFont =
  ICON_FONT_URL &&
  Icon.createFromIconfontCN({
    scriptUrl: ICON_FONT_URL,
  });

function getIcon(iconName) {
  if (!Icon[iconName]) {
    return null;
  }
  return React.createElement(Icon[iconName]);
}
const SubMenuIcon = React.memo(({ showIcon, icon, className = 'submenu-icon' }) => {
  if (!showIcon || !icon) {
    return null;
  }
  if (typeof icon === 'string') {
    if (icon.indexOf('icon-') > -1) {
      return <IconFont type={icon} />;
    }
    return <span className={className}>{getIcon(icon)}</span>;
  }
  return <span className={className}>{icon}</span>;
});

/**
 * 子项是否都不可见
 * @param {*} menuData
 * @returns
 */
function isNoAccess(menuData) {
  if (isEmptyArray(menuData)) {
    return false;
  }
  return menuData
    .filter((v) => {
      const showMenu = !v.hideInMenu && !v.hideChildrenInMenu;
      const is404 = v.path.indexOf('/.') > -1;
      const isDirect = v.element?.props?.to;
      return showMenu && !is404 && !isDirect;
    })
    .every((v) => v.unaccessible);
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout = ({
  initialState,
  // setInitialState
}) => {
  const menuDataRender = (menuData, isParent = true) => {
    const menu = [];
    menuData.forEach((item) => {
      const children = item.children ? menuDataRender(item.children, false) : undefined;
      let localItem = {
        ...item,
        children,
        // unaccessible: item.unaccessible || isNoAccess(children),
      };
      if (item.group && isParent) {
        const menuItemIndex = menu.findIndex((v) => v.type === 'group' && v.name === item.group);
        if (menuItemIndex > -1) {
          // 本身group存在
          menu[menuItemIndex].children.push(localItem);
          menu[menuItemIndex].unaccessible = isNoAccess(menu[menuItemIndex].children);
          return;
        }
        localItem = {
          key: item.group,
          name: item.group,
          type: 'group',
          children: [localItem],
          unaccessible: isNoAccess([localItem]),
        };
      }
      menu.push(localItem);
    });

    return menu;
  };


  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { location } = usePageProps();

  const MenuItem = ({ menuChildren }) => {
    if (initialState?.settings?.menu?.type === 'group') {
      const groupMap = {};

      menuChildren?.forEach((item) => {
        if (groupMap[item?.group]) {
          groupMap[item?.group].push(item);
        } else {
          groupMap[item?.group] = [item];
        }
      });

      return (
        <div className="customMenuContainer">
          {Object.keys(groupMap)?.map((key) => (
            <div className="customMenuBox" key={key}>
              <div className="customMenuItemTitle">
                <span className="bar" />
                <span>{key}</span>
              </div>
              <div className="customMenuItemContent">
                {groupMap[key]?.map((item) => {
                  return (
                    <div
                      onClick={() => history.push(item.path)}
                      key={item?.key}
                      className={`customMenuItem ${
                        location?.pathname === item.path ? 'customMenuItemActive' : ''
                      }`}
                      style={{ marginRight: 16 }}
                    >
                      <SubMenuIcon showIcon={item.showIcon} icon={item.icon} />
                      {item?.name}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return menuChildren?.map((item) => (
      <div
        onClick={() => history.push(item.path)}
        key={item?.key}
        className={`customMenuItem ${
          location?.pathname === item.path ? 'customMenuItemActive' : ''
        }`}
      >
        <SubMenuIcon showIcon={item.showIcon} icon={item.icon} />
        {item?.name}
      </div>
    ));
  };

  const headerRender = (props, dom) => {
    const getMenuList = (menuData, isParent = true) => {
      const menu = [];
      menuData.forEach((item) => {
        const children = item.children ? getMenuList(item.children, false) : undefined;
        if (!item?.name || item?.hideInMenu) {
          return;
        }
        let localItem = {
          ...item,
          label: item?.name,
          children,
          unaccessible: item.unaccessible || isNoAccess(children),
        };
        if (item.group && isParent) {
          const menuItemIndex = menu.findIndex((v) => v.type === 'group' && v.name === item.group);
          if (menuItemIndex > -1) {
            // 本身group存在
            menu[menuItemIndex].children.push(localItem);
            menu[menuItemIndex].unaccessible = isNoAccess(menu[menuItemIndex].children);
            return;
          }
          localItem = {
            key: item.group,
            label: item.group,
            type: 'group',
            children: [localItem],
            unaccessible: isNoAccess([localItem]),
          };
        }
        menu.push(localItem);
      });
      return menu;
    };
    const menuList = getMenuList(props.menuData);
    const activeKey = '/' + location?.pathname?.split('/')[1];

    return (
      <>
        {dom}
        {initialState?.settings?.menu?.custom && (
          <div className="customMenu">
            <Tabs
              activeKey={activeKey}
              tabPosition="top"
              style={{ height: 64, width: 'calc(100vw - 380px)' }}
              items={menuList.map((val) => {
                return {
                  label: isEmptyArray(val?.children) ? (
                    <span>
                      {val?.icon}
                      {val?.label}
                    </span>
                  ) : (
                    <Popover
                      content={<MenuItem menuChildren={val?.children} />}
                      placement="bottomLeft"
                    >
                      <span>
                        {val?.icon}
                        {val?.label}
                      </span>
                    </Popover>
                  ),
                  key: val?.path,
                };
              })}
              onChange={(val) => {
                const menuItem = menuList?.find((item) => item?.path === val);
                if (
                  menuItem &&
                  isEmptyArray(menuList?.find((item) => item?.path === val)?.children)
                ) {
                  history.push(val);
                }
              }}
            />
          </div>
        )}
      </>
    );
  };

  return {
    logo: (
      <div
        className="header"
        style={{
          color: '#fff',
          fontWeight: 800,
          fontSize: '24px',
        }}
      >
        区块链供应链金融平台
      </div>
    ),
    /**
     * 使用 Token 快速的修改组件库的基础样式
     * @doc https://procomponents.ant.design/components/layout/#token
     */
    token: {
      bgLayout: '#f0f2f5', // layout 的背景颜色
      sider: {
        colorMenuBackground: '#fff', // menu 的背景颜色
        colorBgMenuItemSelected: '#F6F6F6', // 选中背景色
      },
      header: {
        colorBgHeader: defaultSettings.colorPrimary, // header 的背景颜色
        heightLayoutHeader: 64, // header 高度
      },
    },
    rightContentRender: () => <RightContent />,
    // waterMarkProps: {
    //   content: initialState?.currentUser?.name,
    // },
    // footerRender: () => <Footer />,
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    layoutBgImgList: [],
    links: [],
    menuDataRender,
    menuHeaderRender: undefined,
    menuItemRender: (menuItemProps, defaultDom) => {
      if (menuItemProps.targetUrl) {
        return (
          <a onClick={() => handleTargetJump(menuItemProps.targetUrl, menuItemProps.target)}>
            {defaultDom}
          </a>
        );
      }
      if (menuItemProps.isUrl || !menuItemProps.path) {
        return defaultDom;
      }
      // 支持二级菜单显示icon
      return (
        <Link to={menuItemProps.path}>
          <SubMenuIcon showIcon={menuItemProps.showIcon} icon={menuItemProps.icon} />
          {defaultDom}
        </Link>
      );
    },
    menuRender: (props, dom) => (initialState?.settings?.menu?.custom ? false : dom),
    headerRender,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return initialState?.settings?.multipleTabs ? (
        <RouteContext.Consumer>
          {(ctx) => <SwitchTabs menuData={ctx?.menuData} />}
        </RouteContext.Consumer>
      ) : (
        <ConfigProvider
          input={{ autoComplete: 'off', placeholder: '请输入' }}
          select={{ allowclear: true, placeholder: '请选择' }}
          locale={zhCN}
          {...props}
        >
          {children}
        </ConfigProvider>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
  paramsSerializer: (params) => stringify(params, { indices: false }),
  // timeout: 3000,
};

/**
 * 低版本提示：where改写
 * @param {*} container
 * @returns
 */
export function rootContainer(container) {
  const browserInfo = getBrowserInfo();
  if (browserInfo.visible) {
    return container;
  }
  if (browserInfo?.engine.name === 'IE') {
    alert(' 检测到您正在使用IE浏览器，为了不影响正常使用，请选择其他浏览器打开');
    return (
      <h3
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
        }}
      >
        <Icon.InfoCircleOutlined />
        检测到您正在使用IE浏览器，为了不影响正常使用，请选择其他浏览器打开
      </h3>
    );
  }
  alert(
    '检测到您当前浏览器版本过低，为了不影响您的用户体验，请升级当前浏览器或者选择其他浏览器打开',
  );
  return React.createElement(
    StyleProvider,
    {
      hashPriority: 'high',
      transformers: [legacyLogicalPropertiesTransformer],
    },
    container,
  );
}
