/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
import { USER_TYPE_MAP } from '@/common/enum';

export default function access(initialState) {
  const { currentUser } = initialState || {};

  return {
    canAdmin: currentUser && currentUser.access === USER_TYPE_MAP.ADMIN.code,
    normalRouteFilter: (route) => {
      // 用以判断用户是否拥有路由权限
      return currentUser?.hasRoutesKeys?.includes(route.menuKey) || false;
    },
    canOperate: (routeKey, operateKey) => {
      return currentUser?.hasRoutesKeys?.includes(`${routeKey}.${operateKey}`) || false;
    },
  };
}
