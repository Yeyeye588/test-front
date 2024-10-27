/* eslint-disable no-param-reassign */

/* eslint-disable no-restricted-globals */

/* eslint-disable prefer-promise-reject-errors */
import React from 'react';
import { Tooltip } from 'antd';
import { getMatchMenu } from '@umijs/route-utils';
import * as pathRegexp from 'path-to-regexp';
import { pathToRegexp } from 'path-to-regexp';
import { stringify } from 'querystring';

/* eslint no-useless-escape:0 */
const reg =
  /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
export const isUrl = (path) => reg.test(path);

/**
 * 获取地址的参数
 * @param {*} href 地址
 * @param {*} needDecode 是否url解码
 * @returns
 */
export const getPageQuery = (href = window?.location?.href, needDecode = true) => {
  const reg = /([^&=]+)=([\w\W]*?)(&|$|#)/g;
  const { search, hash } = new URL(href);
  const args = [search, hash];
  let obj = {};
  for (let i = 0; i < args.length; i++) {
    const str = args[i];
    if (str) {
      const s = str.replace(/#|\//g, '');
      const arr = s.split('?');
      if (arr.length > 1) {
        for (let i = 1; i < arr.length; i++) {
          let res;
          while ((res = reg.exec(arr[i]))) {
            obj[res[1]] = needDecode ? decodeURIComponent(res[2]) : res[2];
          }
        }
      }
    }
  }
  return obj;
};

/**
 * 路径获取
 * @param {*} path
 * @returns
 */
export function formatPath(path) {
  const pathReg = new RegExp(window.routerBase === '/' ? '' : window.routerBase, 'g');
  const normalPath = path?.replace(pathReg, '');
  return window.routerBase === '/' ? normalPath : `/${normalPath}`;
}

/**
 * 路径拼接
 * @param {*} path
 * @param {*} query
 * @returns
 */
export function getQueryPath(path = '', query = {}) {
  const normalPath = formatPath(path);
  const search = stringify(query);
  if (search.length) {
    return `${normalPath}?${search}`;
  }
  return normalPath;
}

/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */

export const getAuthorityFromRouter = (router = [], pathname) => {
  const authority = router.find(
    ({ routes, path = '/', target = '_self' }) =>
      (path && target !== '_blank' && pathRegexp(path).exec(pathname)) ||
      (routes && getAuthorityFromRouter(routes, pathname)),
  );
  if (authority) return authority;
  return undefined;
};

export const getRouteAuthority = (path, routeData) => {
  let authorities;
  routeData.forEach((route) => {
    // match prefix
    if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
      if (route.authority) {
        authorities = route.authority;
      } // exact match

      if (route.path === path) {
        authorities = route.authority || authorities;
      } // get children authority recursively

      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};

/**
 * 截取列表内容，获得列表长度气泡
 * @param {String} data 列表内容
 * @param {Object} params {len: 长度限制, width: 宽度限制， tooltip其他属性}
 */
export function getToolTip(data, { len = 0, width = 240, show = false, style = {}, ...props }) {
  if (data === '-') {
    return <span>-</span>;
  }
  if (show && data.length > len) {
    return (
      <Tooltip title={data} placement="topLeft" {...props}>
        <span>{data}</span>
      </Tooltip>
    );
  }
  if (data && len > 0) {
    if (data.length > len) {
      return (
        <Tooltip title={data} placement="topLeft" {...props}>
          <span>{`${data.substring(0, len)}...`}</span>
        </Tooltip>
      );
    }
    return <span>{data}</span>;
  }
  return (
    <Tooltip title={data} placement="topLeft" {...props}>
      <div
        style={{
          ...style,
          maxWidth: width,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {data}
      </div>
    </Tooltip>
  );
}

/**
 * Promise.all 并发限制数量
 * @param {*} promises
 * @param {*} batchSize
 */
export async function PromiseAll(promises, batchSize = 1) {
  const result = [];
  while (promises.length > 0) {
    // eslint-disable-next-line no-await-in-loop
    const data = await Promise.all(promises.splice(0, batchSize));
    result.push(...data);
  }
  return result;
}

/**
 * 判断是否为JSON
 * @param {*} str
 */
export function isJSON(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  return false;
}

/**
 * 是否为数组
 * @param {*} val
 * @returns
 */
export function isArray(val) {
  return Object.prototype.toString.call(val) === '[object Array]';
}

/**
 * 是否为对象
 * @param {*} val
 * @returns
 */
export function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

/**
 * 是否为函数
 * @param {*} val
 * @returns
 */
export function isFunction(val) {
  return Object.prototype.toString.call(val) === '[object Function]';
}

/**
 * 是否为布尔
 * @param {*} val
 * @returns
 */
export function isBoolean(val) {
  return Object.prototype.toString.call(val) === '[object Boolean]';
}

/**
 * 空数组
 * @param {*} arr
 */
export function isEmptyArray(arr) {
  if (arr instanceof Array && arr.length > 0) {
    return false;
  }
  return true;
}

/**
 * 得到token
 */
export function getProjectToken() {
  return localStorage.getItem(`${PROJECT_KEY}-token`) || '';
}

/**
 * 清空token
 */
export function rmProjectToken() {
  localStorage.removeItem(`${PROJECT_KEY}-token`);
  sessionStorage.removeItem(`${PROJECT_KEY}-lastPathMap`);
  sessionStorage.removeItem(`${PROJECT_KEY}-tabPages`);
}

/**
 * setItem
 * @param {*} value
 */
export function setProjectToken(value) {
  return localStorage.setItem(`${PROJECT_KEY}-token`, value);
}

// 排序属性
export const SORT_PROPS = {
  ORDER: {
    ACE: {
      code: 'ACE',
      desc: '升序',
    },
    DESCE: {
      code: 'DESCE',
      desc: '降序',
    },
  },
  VAL_ATTR: {
    NUMBER: {
      code: 'NUMBER',
      desc: '数值',
    },
    STRING: {
      code: 'STRING',
      desc: '字符',
    },
    DATE: {
      code: 'DATE',
      desc: '时间',
    },
  },
};

/**
 * 数组排序
 * @param {*} value
 * @param {*} key
 * @returns
 */
export function sortArray(value, key = 'orderIndex', sortProps = {}) {
  const { order = SORT_PROPS.ORDER.ACE, valAttr = SORT_PROPS.VAL_ATTR.NUMBER } = sortProps || {};
  const compareFunc = (a, b) => {
    if (valAttr === SORT_PROPS.VAL_ATTR.NUMBER) {
      if (order === SORT_PROPS.ORDER.DESCE) {
        return Number(b) - Number(a);
      }
      return Number(a) - Number(b);
    }
    if (valAttr === SORT_PROPS.VAL_ATTR.STRING) {
      if (order === SORT_PROPS.ORDER.DESCE) {
        return b.localeCompare(a);
      }
      return a.localeCompare(b);
    }
    if (order === SORT_PROPS.ORDER.DESCE) {
      return b - a;
    }
    return a - b;
  };
  if (!value || !(value instanceof Array)) {
    return [];
  }
  const child = value[0];
  if (typeof child === 'object') {
    return value.sort((a, b) => compareFunc(a[key], b[key]));
  }
  return value.sort(compareFunc);
}

// 获取数值对应的百分比宽度
export function getWidth(num, tNum) {
  const newN = Number(num);
  const newTNum = Number(tNum);
  if (isNaN(newN) || isNaN(newTNum) || !newTNum) {
    return '0%';
  }
  if (newN === newTNum) {
    return '100%';
  }
  const percent = parseFloat((newN / newTNum) * 100);
  if (percent >= 100) return '100%';
  return `${percent.toFixed(2)}%`;
}

/*
 ** randomWord 产生任意长度随机字母数字组合
 ** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
 */
export function randomWord(randomFlag, min, max) {
  let str = '';
  let range = min;
  const arr =
    '0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z'.split(
      ',',
    );

  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min;
  }
  for (let i = 0; i < range; i += 1) {
    const pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}

/**
 * 分步表单写入localStorage
 * @param {String} oldHash
 * @param {Object} data
 */
export function setStepFormAndReadHash(oldHash = '', data) {
  if (!oldHash) {
    if (localStorage.getItem(`${PROJECT_KEY}-step-form-key`)) {
      const oldKey = localStorage.getItem(`${PROJECT_KEY}-step-form-key`);
      localStorage.removeItem(oldKey);
      localStorage.removeItem(`${PROJECT_KEY}-step-form-key`);
    }
    const newHash = randomWord(false, 30);
    localStorage.setItem(
      `${PROJECT_KEY}_${newHash}`,
      JSON.stringify(data, (k, v) => {
        if (v === undefined) {
          return '';
        }
        return v;
      }),
    );
    localStorage.setItem(`${PROJECT_KEY}-step-form-key`, `${PROJECT_KEY}_${newHash}`);
    return newHash;
  }
  localStorage.setItem(
    `${PROJECT_KEY}_${oldHash}`,
    JSON.stringify(data, (k, v) => {
      if (v === undefined) {
        return '';
      }
      return v;
    }),
  );
  localStorage.setItem(`${PROJECT_KEY}-step-form-key`, `${PROJECT_KEY}_${oldHash}`);
  return oldHash;
}

/**
 * 从localStorage读取分步表单值
 * @param {String} hash
 */
export function readProjectItem(hash) {
  return localStorage.getItem(`${PROJECT_KEY}_${hash}`)
    ? JSON.parse(localStorage.getItem(`${PROJECT_KEY}_${hash}`))
    : {};
}

/**
 * 获取父级路由信息
 * @param {*} childPath
 * @returns
 */
export function getParentRoute(childPath) {
  const menuData = localStorage.getItem(`${PROJECT_KEY}-menu-data`)
    ? JSON.parse(localStorage.getItem(`${PROJECT_KEY}-menu-data`))
    : [];
  const getParentRoutes = (path = childPath, menu, parentMenu = []) => {
    if (path === '/' || isEmptyArray(menu)) {
      return parentMenu;
    }
    const parentMenuItem = getMatchMenu(path || '/', menu).pop() || {};
    if (parentMenuItem?.path !== path) {
      parentMenu.push(parentMenuItem);
      return getParentRoutes(path, parentMenuItem?.routes, parentMenu);
    }
    return parentMenu;
  };
  return getParentRoutes(childPath, menuData);
}

/**
 * 获得面包屑路由信息
 * @param {*} childPath
 * @param {*} childName
 * @param {*} len
 * @returns
 */
export function getBreadcrumbList(childPath, childName = '', len = 2) {
  const list = childName
    ? [
        {
          title: childName,
        },
      ]
    : [];
  let total = list.length;
  const parentRoute = getParentRoute(childPath);
  for (let i = parentRoute?.length - 1; i >= 0; i -= 1) {
    list.push({
      title: parentRoute[i]?.name,
      path: parentRoute[i]?.path,
    });
    total += 1;
    if (total === len) {
      break;
    }
  }
  return list?.reverse();
}

/**
 * 获得下一个tab key
 * @param {*} arr
 * @param {*} tabKey
 * @param {*} key
 * @returns
 */
export function getNextTabKey(arr = [], tabKey, key = 'key') {
  if (arr instanceof Array) {
    const tabIndex = arr.findIndex((item) => item[key] === tabKey);
    if (tabIndex === arr.length - 1) {
      return arr[0][key];
    }
    return arr[tabIndex + 1][key];
  }
  return tabKey;
}

/**
 * 枚举转成数组
 * @param {*} map
 */
export function transferArray(map = {}, key = 'key', value = 'value') {
  const keys = typeof map === 'object' && Object.keys(map);
  if (!keys) {
    return [];
  }
  const values = [];
  keys.forEach((k) => {
    const obj = {};
    obj[key] = map[k].code;
    obj[value] = map[k].desc;
    values.push(obj);
  });
  return values;
}

/**
 * 身份证校验
 * @param {*} _
 * @param {*} value
 * 身份证15位编码规则：dddddd yymmdd xx p
 * dddddd：6位地区编码
 * yymmdd: 出生年(两位年)月日，如：910215
 * xx: 顺序编码，系统产生，无法确定
 * p: 性别，奇数为男，偶数为女
 *
 * 身份证18位编码规则：dddddd yyyymmdd xxx y
 * dddddd：6位地区编码
 * yyyymmdd: 出生年(四位年)月日，如：19910215
 * xxx：顺序编码，系统产生，无法确定，奇数为男，偶数为女
 * y: 校验码，该位数值可通过前17位计算获得
 *
 * 前17位号码加权因子为 Wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ]
 * 验证位 Y = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ]
 * 如果验证码恰好是10，为了保证身份证是十八位，那么第十八位将用X来代替
 * 校验位计算公式：Y_P = mod( ∑(Ai×Wi),11 )
 * i为身份证号码1...17 位; Y_P为校验码Y所在校验码数组位置
 */
export function checkIdCard(_, value) {
  // 身份证验证
  if (value) {
    const IdCardReg =
      /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
    if (value.match(IdCardReg)) {
      const idCardWi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]; // 将前17位加权因子保存在数组里
      const idCardY = ['1', '0', '10', '9', '8', '7', '6', '5', '4', '3', '2']; // 这是除以11后，可能产生的11位余数、验证码，也保存成数组
      let idCardWiSum = 0; // 用来保存前17位各自乖以加权因子后的总和
      for (let i = 0; i < 17; i += 1) {
        idCardWiSum += value.substring(i, i + 1) * idCardWi[i];
      }
      const idCardMod = idCardWiSum % 11; // 计算出校验码所在数组的位置
      const idCardLast = value.substring(17); // 得到最后一位身份证号码
      // 如果等于2，则说明校验码是10，身份证号码最后一位应该是X
      if (idCardMod === 2) {
        if (idCardLast === 'X' || idCardLast === 'x') {
          return Promise.resolve();
        }
        return Promise.reject('请输入有效的身份证');
      }
      if (idCardLast === idCardY[idCardMod]) {
        // 用计算出的验证码与最后一位身份证号码匹配，如果一致，说明通过，否则是无效的身份证号码
        return Promise.resolve();
      }
      return Promise.reject('请输入有效的身份证');
    }
    return Promise.reject('请输入有效的身份证');
  }
  return Promise.resolve();
}

/**
 * 处理oss url
 * @param url
 */
export function getFileOssUrl(fileConfig = {}, ossConfig = {}) {
  const { url, prefix, fileName } = fileConfig || {};
  const {
    accessKeyId = 'accessKeyId',
    accessKeySecret = 'accessKeySecret',
    endpoint = 'https://oss-cn-hangzhou.aliyuncs.com/',
    bucket = 'endpoint',
  } = ossConfig || {};
  if (!url) return false;
  // 签名处理
  // eslint-disable-next-line no-undef
  const client = new OSS({
    accessKeyId,
    accessKeySecret,
    endpoint,
    bucket,
  });
  let origin = url;
  const name = fileName || origin.replace(prefix, '');
  const response = {
    'content-disposition': `attachment; filename=${encodeURIComponent(name)}`,
  };
  // 替换图片路径为新的预签名url
  origin = client.signatureUrl(name, { response });
  return origin;
}

/**
 * 动态追加动画className
 * @param {*} el  dom
 * @param {*} c  class
 * @param {*} time 动画时间
 */
export function AddAnimation(el, c, time) {
  el.className += c;
  setTimeout(() => {
    let domClass = el.className;
    domClass = domClass.replace(c, '');
    el.className = domClass;
  }, time);
}

// 获取数组中最大值
export function getMaxValue(data = [], key = 'num') {
  if (data instanceof Array) {
    const tmpArr = data.map((item) => {
      item[key] = Number(item[key]);
      if (isNaN(item[key])) {
        return 0;
      }
      return item[key];
    });
    const maxValue = Math.max(...tmpArr);
    return maxValue || 1;
  }
  return 1;
}

// el是否包含某个class
export const hasClass = (el, className) => {
  // eslint-disable-next-line no-shadow
  const reg = new RegExp(`(^|\\s)${className}(\\s|$)`);
  return reg.test(el.className);
};

// el添加某个class
export const addClass = (el, className) => {
  if (hasClass(el, className)) {
    return;
  }
  const newClass = el.className.split(' ');
  newClass.push(className);
  el.className = newClass.join(' ');
};

// el去除某个class
export const removeClass = (el, className) => {
  if (!hasClass(el, className)) {
    return;
  }
  // eslint-disable-next-line no-shadow
  const reg = new RegExp(`(^|\\s)${className}(\\s|$)`, 'g');
  el.className = el.className.replace(reg, ' ');
};

// 获取浏览器类型（名称）
export function getBrowserType() {
  const str = window.navigator.userAgent;
  let name;
  if (str.indexOf('Opera') > -1 || str.indexOf('OPR') > -1) {
    name = 'Opera';
    return name;
  }
  if (str.indexOf('Edge') > -1) {
    name = 'Edge';
    return name;
  }
  if (str.indexOf('Firefox') > -1) {
    name = 'Firefox';
    return name;
  }
  if (str.indexOf('Chrome') > -1 && str.indexOf('Safari') > -1) {
    name = 'Chrome';
    return name;
  }
  if (str.indexOf('Chrome') === -1 && str.indexOf('Safari') > -1) {
    name = 'Safari';
    return name;
  }
  if ((str.indexOf('Opera') === -1 && str.indexOf('MSIE') > -1) || str.indexOf('Trident') > -1) {
    name = 'IE';
    return name;
  }
  return name;
}

/*
 * 生日转为年龄（精确到月份）
 */
export function birthdayToAge(birthday) {
  const aDate = new Date();
  const thisYear = aDate.getFullYear();
  const bDate = new Date(birthday);
  const brith = bDate.getFullYear();
  let age = thisYear - brith;
  if (aDate.getMonth() === bDate.getMonth()) {
    if (aDate.getDate() < bDate.getDate()) {
      age -= 1;
    }
  } else if (aDate.getMonth() < bDate.getMonth()) {
    age -= 1;
  }
  return age;
}

/**
 * 是否为政务服务环境
 * @returns
 */
export function isGovENV() {
  return ENV === 'aligov';
}

/**
 * 对象数组扁平化
 * @param {*} arr
 * @returns
 */
export function flatten(arr, key = 'children') {
  return isEmptyArray(arr)
    ? []
    : arr.reduce((result, item) => {
        return result.concat(item, Array.isArray(item[key]) ? flatten(item[key]) : []);
      }, []);
}

/**
 * 判断路由是否匹配
 * @param {*} locationPathname
 * @param {*} routePath
 * @returns
 */
export function isMatchingRoute(locationPathname, routePath) {
  return pathToRegexp(routePath).exec(locationPathname);
}

/**
 * 获得path匹配对应路由信息
 * @param {*} path
 * @param {*} routeData
 * @returns
 */
export function getPathRouteProps(path, routeData) {
  if (isEmptyArray(routeData)) {
    return {};
  }
  return routeData.find((v) => isMatchingRoute(path, v.path)) || {};
}

/**
 * 对象数组去重
 * @param {*} arr
 * @param {*} key
 * @returns
 */
export function uniqueFunc(arr, key) {
  const res = new Map();
  return arr.filter((item) => !res.has(item[key]) && res.set(item[key], 1));
}
