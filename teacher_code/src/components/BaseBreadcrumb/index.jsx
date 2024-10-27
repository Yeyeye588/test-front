import React from 'react';
import { history } from '@umijs/max';
import { formatPath } from '@/utils/utils';
import styles from './index.less';

const BaseBreadcrumb = React.memo(({ breadcrumb = [], splitIcon = '/' }) => {
  const handleLink = (path) => {
    const routePathArr =
      localStorage.getItem(`${window.projectKey}-route-history`) &&
      JSON.parse(localStorage.getItem(`${window.projectKey}-route-history`)) instanceof Array
        ? JSON.parse(localStorage.getItem(`${window.projectKey}-route-history`))
        : [];
    // 查找完全匹配的
    let item = routePathArr.reverse().find((v) => {
      const [p] = v?.split('?');
      return p === path;
    });
    const currentPath = formatPath(
      window.historyType === 'hash'
        ? window.location.hash?.substring(1)?.split('?')[0]
        : window.location.pathname,
    );
    if (!item) {
      let popLen = breadcrumb?.length;
      const data = routePathArr.reverse();
      while (popLen > 0) {
        popLen -= 1;
        const val = data.pop();
        const [p] = val?.split('?');
        if (p === path || (p.indexOf(path) > -1 && p !== currentPath)) {
          item = val;
          break;
        }
      }
    }
    history.replace(item || path);
  };
  return breadcrumb instanceof Array ? (
    <div className={styles.breadcrumb}>
      {breadcrumb.map((item, index) => (
        <div key={item.title || item.breadcrumbName || index}>
          {item.path ? (
            <a
              onClick={() => handleLink(item.path, index)}
              className={`${styles.path} ${item.path && styles.link}`}
            >
              {item.title || item.breadcrumbName}
            </a>
          ) : (
            <span>{item.title || item.breadcrumbName}</span>
          )}
          {index < breadcrumb.length - 1 && <span className={styles.splitIcon}>{splitIcon}</span>}
        </div>
      ))}
    </div>
  ) : (
    <span>{breadcrumb}</span>
  );
});

export default BaseBreadcrumb;
