import { history } from '@umijs/max';
import { getQueryPath } from './utils';

export const UrlQueryParamTypes = {
  string: 'string',
  number: 'number',
  array: 'array',
};

export function checkType(key, val, urlPropsQueryConfig = {}) {
  const types = urlPropsQueryConfig[key];
  if (!types) {
    return val || undefined;
  }
  if (types && types.type === UrlQueryParamTypes.number) {
    // eslint-disable-next-line no-restricted-globals
    return (val && !isNaN(Number(val))) || val === 0 ? Number(val) : undefined;
  }
  return val || undefined;
}

export function formatQuery(query, urlPropsQueryConfig = {}) {
  if (!query || typeof query !== 'object') {
    return {};
  }
  const obj = {};
  Object.keys(query).forEach((key) => {
    obj[key] = checkType(key, query[key], urlPropsQueryConfig);
  });
  return obj;
}

/**
 * 替换当前路由
 * @param {*} query
 */
export function replaceRoute(query) {
  let path = window.location.pathname;
  if (window.historyType === 'hash') {
    path = window.location.hash?.substring(1)?.split('?')?.[0];
  }
  history.replace(getQueryPath(path, query));
}
