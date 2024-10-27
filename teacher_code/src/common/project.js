import React from 'react';
import fileRequest from '@/utils/fileRequest';
import { formatVal } from '@/utils/format';
import { isEmptyArray } from '@/utils/utils';
import { HOST } from '@/services/host';
import { FILE_PREVIEW_URL, USER_TYPE_MAP } from './enum';

/**
 * 是否为管理员
 * @param {*} type
 * @returns
 */
export function isAdmin(type) {
  return [USER_TYPE_MAP.ADMIN.code].includes(type);
}

/**
 * 是否为用户
 * @param {*} type
 * @returns
 */
export function isUser(type) {
  return [USER_TYPE_MAP.USER.code].includes(type);
}

/**
 * 保留两位小数
 * @param {*} val
 */
export function formatTwoWithNum(val) {
  if (!val) return val;
  let str = String(val);
  const numI = str?.indexOf('.');
  if (numI > -1) {
    const tmp = str.substring(numI);
    for (let i = tmp.length; i < 3; i += 1) {
      str += '0';
    }
  } else {
    str += '.00';
  }
  return str;
}

/**
 * 表单保留两位小数
 * @param {*} form  表单
 * @param {*} text FieldName
 */
export function saveTwoWithNum(form = {}, text = '', key = 0) {
  const { validateFields, setFieldsValue } = form;
  validateFields([text]).then((value) => {
    let str = value[text];
    let isArray = false;
    if (str instanceof Array) {
      str = str[key];
      isArray = true;
    }
    str = formatTwoWithNum(str);
    if (isArray) {
      setFieldsValue({ [`${text}[${key}]`]: str });
    } else {
      setFieldsValue({ [text]: str });
    }
  });
}

/**
 * 最大的值
 * @param {*} rule
 * @param {*} value
 * @param {*} maxNum
 * @param {*} message
 */
export function checkLimitNum({ value, maxNum = 100000000, message, minNum = 0 }) {
  if (value) {
    const num = Number(value);
    if (num > maxNum || num < minNum) {
      return Promise.reject(message);
    }
    return Promise.resolve();
  }
  return Promise.resolve();
}

/**
 * 获得校验规则
 * @param {*} text
 * @param {*} params {required = true, maxLen = 20, select = false, pattern = null, validateLen = true }
 * @examples
 * getNormalRules('手机号, {pattern: 手机正则,validateLen: false }) => [{required: true, message: '请输入手机号'}, {pattern: 手机正则, message: '请输入正确的手机号'}]
 */
export function getNormalRules(text, params = {}) {
  const {
    required = true,
    maxLen = 20,
    select = false,
    pattern = null,
    validateLen = true,
  } = params;
  const rules = [];
  const oprerate = select ? '请选择' : '请输入';
  if (required) {
    rules.push({
      required: true,
      message: `${oprerate}${text}`,
    });
  }
  if (!select && validateLen) {
    rules.push({
      max: maxLen,
      message: `${oprerate}不超过${maxLen}个字的${text}`,
    });
  }
  if (pattern) {
    rules.push({
      pattern,
      message: `${oprerate}正确的${text}`,
    });
  }
  return rules;
}

/**
 * 校验依赖输入
 * @param {*} files
 * @param {*} value
 */
export function validateDependiceInput(files, value) {
  const val = formatVal(value, '-');
  if (files instanceof Array && files.length > 0 && val === '-') {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject('请输入');
  }
  return Promise.resolve();
}

/**
 * 获取文件预览地址
 * @param {*} key
 */
export function getPreFileUrl(fileKey, prefixUrl = '/api/v1/file/preview') {
  return `${window.location.origin}${prefixUrl}?fileKey=${fileKey}`;
}

/**
 * 检查当前权限
 * @param {*} r
 */
export function checkAuthority(r, allAuth) {
  if (r instanceof Array) {
    if (allAuth instanceof Array) {
      return r.some((item) => allAuth.includes(item));
    }
    return allAuth && r.includes(allAuth);
  }
  if (!r) {
    return false;
  }
  if (allAuth instanceof Array) {
    return allAuth.includes(r);
  }
  return allAuth && allAuth === r;
}

/**
 * 下载文件模板
 * @param {*} templateType 模板类型
 * @param {*} fileName 文件模板名称
 */
export function downloadFileTemplate(templateType = 1, fileName = '文件.xlsx') {
  return fileRequest(`${HOST}/v1/excel/downLoadExcel?type=${templateType}`, {
    fileName,
  });
}

/**
 * 下载文件
 * @param {*} action 文件地址 /v1/file/download
 * @param {*} templateTypeObj  文件类型枚举{code: 1, desc: 'xxx.xlsx'}
 */
export function downloadFile(action = FILE_PREVIEW_URL, fileName = '文件.xlsx') {
  return fileRequest(`${HOST}${action}`, {
    fileName,
  });
}

/**
 * 枚举转成对象
 * @param {*} map  {as: {
 * code: 1, desc: 'askdj' }} => {1: 'askdj}
 */
export function transferMap(map = {}) {
  const keys = typeof map === 'object' && Object.keys(map);
  if (!keys) {
    return {};
  }
  const obj = {};
  keys.forEach((k) => {
    obj[map[k].code] = map[k].desc;
  });
  return obj;
}

/**
 * 获得数组前几位
 * @param {*} val
 * @param {*} len
 * @returns
 */
export function getArrLimitItem(val = [], len = 1) {
  if (!isEmptyArray(val)) {
    if (len === 1) {
      return val[0];
    }
    return val.slice(0, len);
  }
  return val || {};
}
