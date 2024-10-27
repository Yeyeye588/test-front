/* eslint-disable no-restricted-globals */
import moment from 'moment';
import { getPreFileUrl } from '@/common/project';
import { FILE_PREVIEW_URL } from '../common/enum';

/**
 * 格式化年月日
 * @param {*} val
 * @param {*} defaultPlaceHolder
 * @param {*} formatUnix
 */
export function formatTimeToDate(val, defaultPlaceHolder = '-', formatUnix = false) {
  return formatTime(val, `YYYY-MM-DD`, defaultPlaceHolder, formatUnix);
}

/**
 * 格式化时分秒
 * @param {*} val
 * @param {*} defaultPlaceHolder
 * @param {*} formatUnix
 * @returns
 */
export function formatTimeToSecond(val, defaultPlaceHolder = '-', formatUnix = false) {
  return formatTime(val, 'HH:mm:ss', defaultPlaceHolder, formatUnix);
}

/**
 * 格式化年月日 时分秒
 * @param {*} val
 * @param {*} defaultPlaceHolder
 * @param {*} formatUnix
 */
export function formatTimeToDateSecond(val, defaultPlaceHolder = '-', formatUnix = false) {
  return formatTime(val, 'YYYY-MM-DD HH:mm:ss', defaultPlaceHolder, formatUnix);
}

/**
 * 格式化年月日 时分
 * @param {*} val
 * @param {*} defaultPlaceHolder
 * @param {*} formatUnix
 */
export function formatTimeToDateMinute(val, defaultPlaceHolder = '-', formatUnix = false) {
  return formatTime(val, 'YYYY-MM-DD HH:mm', defaultPlaceHolder, formatUnix);
}

/**
 * 格式化时分
 * @param {*} val
 * @param {*} defaultPlaceHolder
 * @param {*} formatUnix
 */
export function formatTimeToMinute(val, defaultPlaceHolder = '-', formatUnix = false) {
  return formatTime(val, 'HH:mm', defaultPlaceHolder, formatUnix);
}

/**
 * 转化成时间戳
 * @param {*} val 
 * @param {*} defaultPlaceHolder 
 * @returns 
 */
export function formatTimeUnix (val, defaultPlaceHolder = '') {
  if (!val || val === defaultPlaceHolder) return defaultPlaceHolder;
  const m  = moment(val).valueOf(); // 时间戳为秒
  return m;
}

/**
 * 自定义时间转换
 * @param {*} val
 * @param {*} layout
 * @param {*} defaultPlaceHolder
 * @param {Boolean} formatUnix 是否为秒
 */
export function formatTime(val, layout, defaultPlaceHolder = '-', formatUnix = false) {
  if (!val || val === defaultPlaceHolder) return defaultPlaceHolder;
  let m = moment(Number(val)); // 时间戳为毫秒
  if (formatUnix) {
    m = moment.unix(Number(val)); // 时间戳为秒
  }
  return m.isValid() ? m.format(layout) : defaultPlaceHolder;
}

/**
 * 格式化数组
 * @param {Array} data
 */
export function formatArray(data, defaultPlaceHolder = '-') {
  const result = data;
  if (data && data instanceof Array) {
    data.forEach((value, id) => {
      Object.keys(value).forEach((key) => {
        if (!key || value[key] === '' || typeof value[key] === 'undefined' || value[key] === null) {
          result[id][key] = defaultPlaceHolder;
        }
      });
    });
  }
  return result;
}

/**
 * 格式化对象
 * @param {Object} data
 */
export function formatObject(data, defaultPlaceHolder = '-') {
  // 格式化对象
  const result = data;
  if (data && data.constructor === Object) {
    Object.keys(data).forEach((key) => {
      if (!key || data[key] === '' || typeof data[key] === 'undefined' || data[key] === null) {
        result[key] = defaultPlaceHolder;
      }
    });
  }
  return result;
}

/**
 * 格式化值
 * @param {*} val
 * @param {*} defaultPlaceHolder 默认展示
 */
export function formatVal(val, defaultPlaceHolder = '-') {
  if (val === '' || typeof val === 'undefined' || val === null) {
    return defaultPlaceHolder;
  }
  return val;
}

/**
 * 字符串转换为布尔值
 * @param {*} val 'true' || 'false'
 */
export function formatStringToBoolean(val) {
  if (val === 'true') {
    return true;
  }
  if (val === 'false') {
    return false;
  }
  return null;
}

/**
 * 最多保留两位小数
 * @param {String} val
 */
export function formatNumStrWithMaxTwoDigit(val) {
  let str = val;
  const numI = val.indexOf('.');
  if (numI > -1) {
    const tmp = str.substring(numI);
    const tmpLen = tmp.length > 2 ? 2 : tmp.length;
    str = str.substring(0, numI + tmpLen + 1);
  }
  return str;
}

/**
 * 强制保留两位小数
 * @param {*} val
 */
export function formatNumStrWithFixTwoDigit(val) {
  let str = val;
  if (!str) return str;
  const numI = val?.indexOf('.');
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
 * 格式化金额（千分位）
 * @param {*} val
 * @param {*} defaultPlaceHolder
 */
export function formatAmount(val, defaultPlaceHolder = '-') {
  const num = Number(val);
  if ((!val && val !== 0) || val === defaultPlaceHolder || isNaN(num)) {
    return defaultPlaceHolder;
  }
  if (num === 0) {
    return '0';
  }
  return num.toLocaleString();
}

/**
 * 只允许输入数值且最多输入两位小数
 * @param {*} e
 */
export function formatFixToNum(e, pos = true) {
  let { value } = e.target;
  const t = value.charAt(0);
  // 如果输入非数字，则替换为''
  value = value?.replace(/[^\d.]/g, '');
  // 必须保证第一个为数字而不是.
  value = value?.replace(/^\./g, '');
  // 前两位不能是0加数字
  value = value?.replace(/^0\d[0-9]*/g, '');
  // 保证只有出现一个.而没有多个.
  value = value?.replace(/\.{2,}/g, '.');
  // 保证.只出现一次，而不能出现两次以上
  value = value?.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
  // 只能输入两位小数
  value = value?.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
  if (t === '-' && !pos) {
    value = `-${value}`;
  }
  return value;
}

/**
 * 布尔格式化为是/否
 * @param {*} val
 * @param {*} defaultPlaceHolder
 */
export function formatBooleanToCN(val, defaultPlaceHolder = '-') {
  if (val === true || val === 1) return '是';
  if (val === false || val === 0) return '否';
  return defaultPlaceHolder;
}

/**
 * 格式化时长
 * @param {*} val
 * @param {*} defaultPlaceHolder
 */
export function formatTimeRange(val, defaultPlaceHolder = '-') {
  if (val === null || val === defaultPlaceHolder || val === undefined) {
    return defaultPlaceHolder;
  }
  const ms = Number(val);
  if (isNaN(ms)) {
    return defaultPlaceHolder;
  }
  // eslint-disable-next-line no-bitwise
  const min = Math.floor((ms / 1000 / 60) << 0);
  const sec = Math.floor((ms / 1000) % 60);
  if (!sec && !min) {
    return `${ms}毫秒`;
  }
  if (!min) {
    return `${sec}秒`;
  }
  if (!sec && min) {
    return `${min}分钟`;
  }
  return `${min}分钟${sec}秒`;
}

/**
 * 转文件 api交互
 * @param {*} arr
 */
export function transferFiles(arr = []) {
  if (arr && arr instanceof Array) {
    const data = arr.map((item) => {
      return {
        fileOriginName: item.name,
        fileKey: item.key,
        fileName: item.name,
      };
    });
    return JSON.stringify(data);
  }
  return JSON.stringify([]);
}

/**
 * 格式化文件
 * @param {*} arr
 */
export function formatFiles(val = [], prefixUrl = FILE_PREVIEW_URL) {
  if (val && val instanceof Array) {
    return val.map((item) => {
      return {
        key: item.fileKey,
        name: item.fileName,
        uid: item.fileKey,
        dataUrl: item.url,
        url: item.url || getPreFileUrl(item.fileKey, prefixUrl),
        status: 'done',
        response: {
          code: 0,
          data: {
            fileKey: item.fileKey,
          },
        },
      };
    });
  }
  if (val && val instanceof Object) {
    return [
      {
        key: val.fileKey,
        name: val.fileName,
        uid: val.fileKey,
        url: getPreFileUrl(val.fileKey),
        status: 'done',
        response: {
          code: 0,
          data: {
            fileKey: val.fileKey,
          },
        },
      },
    ];
  }
  return [];
}

/**
 * 格式化表单
 * @param {*} values
 */
export function formatBrandsForm(values) {
  if (typeof values === 'object') {
    const data = {};
    Object.keys(values).forEach((key) => {
      if (key.indexOf('File') > 0 && values[key] instanceof Array) {
        data[key] = transferFiles(values[key]);
      } else {
        data[key] = values[key];
      }
    });
    return data;
  }
  return values;
}

/**
 * 图表数据处理
 * @param {*} data
 * @param {*} map legend映射 { xx: '啊啊', yy: '奥斯卡级' }
 * @param {*} keys 数据格式映射 { date: xx, num: xx, type: xx }
 */
export function transChartsData(data, map = null, keys = {}) {
  if (data instanceof Array) {
    const arr = [];
    data.forEach((item) => {
      const values = {};
      Object.keys(keys).forEach((key) => {
        values[key] = item[keys[key]];
      });
      if (map && typeof map === 'object') {
        Object.keys(map).forEach((v) => {
          arr.push({
            ...values,
            type: map[v],
            value: item[v],
          });
        });
      } else {
        arr.push(values);
      }
    });
    return arr;
  }
  if (typeof data === 'object') {
    let arr = [];
    Object.keys(data).forEach((key) => {
      const newArr = data[key]?.map((item) => {
        return {
          ...item,
          type: map && typeof map === 'object' ? map[key] || key : key,
        };
      });
      arr = arr.concat(newArr);
    });
    return arr;
  }
  return [];
}

/**
 * 字符转为时间格式化
 * @param {*} val
 * @param {*} layout
 * @param {*} defaultPlaceHolder
 * @returns ‘2020-01-02’ to '2020年1月2日'
 */
export function formatStrToTime(val, layout = 'YYYY年MM月', defaultPlaceHolder = '-') {
  if (!val || val === defaultPlaceHolder) return defaultPlaceHolder;
  const m = moment(val);
  return m.isValid() ? m.format(layout) : defaultPlaceHolder;
}

/**
 * 小数转为百分数
 * @param {*} val
 * @param {*} decimal
 * @param {*} defaultPlaceHolder
 * @returns 0.12 -> 12%
 */
export function formatPercentNum(val, decimal = 0, defaultPlaceHolder = '-') {
  const num = Number(val);
  if ((!val && val !== 0) || val === defaultPlaceHolder) return defaultPlaceHolder;
  return `${Math.abs((num * 100).toFixed(decimal))}%`;
}

/**
 * 数值保留N位小数（四舍五入）
 * @param {*} val
 * @param {*} decimal
 * @param {*} defaultPlaceHolder
 * @returns
 */
export function formatNumWithLimitLen(val, decimal = 0, defaultPlaceHolder = '-') {
  const num = Number(val);
  if ((!val && val !== 0) || val === defaultPlaceHolder || isNaN(num)) {
    return defaultPlaceHolder;
  }
  return num.toFixed(decimal);
}

/**
 * 格式化后转为真实值
 * @param {*} val
 * @param {*} defaultPlaceHolder
 * @returns ‘-’ -> undefined
 */
export function getPlaceVal(val, defaultPlaceHolder = '-') {
  return val && val !== defaultPlaceHolder ? val : undefined;
}

/**
 * 除法
 * @param {*} arg1 分子
 * @param {*} arg2 分母
 */
export function accDiv(arg1, arg2) {
  let t1 = 0;
  let t2 = 0;
  try {
    t1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    t1 = 0;
  }
  try {
    t2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    t2 = 0;
  }
  const r1 = Number(arg1.toString().replace('.', ''));
  const r2 = Number(arg2.toString().replace('.', ''));
  const tmp = 10 ** (t2 - t1);
  return (r1 / r2) * tmp;
}

/**
 * 格式化hash
 * @param {*} val
 * @param {*} startLen 起始显示长度
 * @param {*} endLen 结尾显示长度
 * @param {*} defaultPlaceHolder
 * @example
 * formatTxHash('skjfkjfsklfjslkdfsdfasdffff', 2, 3) => 'sk...fff'
 */
export function formatTxHash(val, startLen = 6, endLen = 6, defaultPlaceHolder = '-') {
  if (!val || val === defaultPlaceHolder) {
    return defaultPlaceHolder;
  }
  if (val.length > startLen + endLen) {
    return `${val.substring(0, startLen)}...${val.substring(val.length - endLen)}`;
  }
  return val;
}

/**
 * 每个单词的首字母转大写
 * @param {*} val
 * @param {*} defaultPlaceHolder
 */
export function handleTitleCase(val, defaultPlaceHolder = '-') {
  if (val && typeof val === 'string') {
    return val.toLowerCase().replace(/(?:^|\s)\w/g, (c) => c.toUpperCase());
  }
  return defaultPlaceHolder;
}

/*
 *手机号码中间4位隐藏花号（*）显示
 */
export function hideMobile(mobile) {
  return mobile.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
}

export function downloadBase64File(base64Data, fileName) {
  const link = document.createElement('a');
  link.href = `${base64Data}`;
  link.download = fileName;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  // 触发链接的点击事件，开始下载文件
  link.click();
}

/**
 * 文件转成base64
 * @param {*} file
 * @returns
 */
export function parseFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}