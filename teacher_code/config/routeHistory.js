/**
 * 监听路由变化放入localStorage中
 */
export default `
// 重写方法
const _wr = (type) => {
  const origin = history[type];
  return function () {
    const event = new Event(type);
    event.arguments = arguments;
    window.dispatchEvent(event);
    return origin.apply(this, arguments);
  };
};

const formatPath = (path) => {
  const pathReg = new RegExp(window.routerBase === '/' ? '' : window.routerBase, 'g');
  const normalPath = path?.replace(pathReg, '');
  return window.routerBase === '/'? normalPath : '/' + normalPath;
};
const getQueryPath = (path = '', search) => {
  const normalPath = formatPath(path);
  if (search.length) {
    return normalPath + search;
  }
  return normalPath;
};
// 重写方法
history.pushState = _wr('pushState');
history.replaceState = _wr('replaceState');

// 实现监听
window.addEventListener('pushState', function (e) {
  var path = window.location.pathname;
  var search = location.search;
  if (window.historyType === 'hash') {
    var tmpUrl = window.location.hash.substring(1);
    path = tmpUrl.split('?')[0];
    if(tmpUrl.split('?')[1]) {
      search = tmpUrl.substring(tmpUrl.indexOf('?'))
    }
  }
  
  const url = getQueryPath(path, search);
  let routePathArr =
    localStorage.getItem(window.projectKey+ '-route-history') &&
    JSON.parse(localStorage.getItem(window.projectKey+ '-route-history')) instanceof Array
      ? JSON.parse(localStorage.getItem(window.projectKey+ '-route-history'))
      : [];
  routePathArr.push(url);
  localStorage.setItem(window.projectKey+ '-route-history', JSON.stringify(routePathArr));
});
function redirectUrl(){
  var hash = window.location.hash;
  if(window.historyType === 'hash' && !hash.includes(window.routerBase)) {
    window.location.href = window.location.origin + window.location.pathname + '#' + window.routerBase;
  }
};
redirectUrl();
`;
