// accpet 支持类型
export const fileTypeEnum = {
  pdf: '.pdf,application/pdf',
  jpeg: '.jpeg,image/jpeg',
  png: '.png,image/png',
  jpg: '.jpg,image/jpg',
  bmp: '.bmp,image/bmp',
  ico: 'image/x-icon',
  gif: '.gif,image/gif',
  svg: '.svg, image/svg+xml',
  xls: '.xls,application/vnd.ms-excel',
  xlsx: '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: '.zip,application/zip,application/x-zip-compressed',
  rar: '.rar,application/rar,application/x-rar,application/x-rar-compressed',
  xml: '.xml,text/xml, application/xml',
  xlw: '.xlw,application/vnd.ms-excel',
  xlt: '.xlt,application/vnd.ms-excel',
  txt: 'text/plain',
  doc: '.doc,application/msword,application/wps-writer',
  docx: '.docx,application/msword,application/wps-writer,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: '.ppt,application/vnd.ms-powerpoint',
  pptx: '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

// base64 文件content Type
export const fileBase64Enum = {
  pdf: 'application/pdf',
  jpeg: 'image/jpeg',
  png: 'image/png',
  jpg: 'image/jpg',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip,application/x-zip-compressed',
  rar: 'application/rar,application/x-rar',
  xml: 'application/xml',
  xlw: 'application/vnd.ms-excel',
  xlt: 'application/vnd.ms-excel',
  txt: 'text/plain',
  doc: 'application/msword',
  docx: 'application/msword,application/wps-writer',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

// 上传展示类型
export const UPLOAD_TYPE = {
  DRAG: {
    code: 'DRAG',
    desc: '文件拖拽',
  },
  PICTURE: {
    code: 'PICTURE',
    desc: '图片卡片',
  },
  BUTTON: {
    code: 'BUTTON',
    desc: '按钮组件',
  },
  TEXT: {
    code: 'TEXT',
    desc: '文字链接',
  },
  CUSTOM: {
    code: 'CUSTOM',
    desc: '自定义',
  },
};

// 裁剪属性
export const CROP_PROPS = {
  modalTitle: '图片裁剪',
  modalOk: '提交',
  modalCancel: '取消',
};

// 预览类型
export const PREVIEW_TYPE = {
  DOWNLOAD: {
    code: 'DOWNLOAD',
    desc: '下载',
  },
  PREVIEW: {
    code: 'PREVIEW',
    desc: '预览',
  },
};
/**
 * 获取http可接受上传文件类型
 * @param {Array} arr 可接受的文件类型后缀/accpetType
 * @param {Boolean} suffix 是否使用文件类型后缀
 */
export function getAcceptTypes(arr = [], suffix = true) {
  if (arr instanceof Array) {
    if (suffix) {
      let values = [];
      arr.forEach((item) => {
        let val = fileTypeEnum[item];
        val = val?.split(',');
        values = values.concat(val);
      });
      return values.join(',');
    }
    return arr.join(',');
  }
  return '';
}

/**
 * 校验文件类型
 * @param {Array} arr 可接受的文件类型后缀/accpetType
 * @param {*} file 当前文件
 * @param {Boolean} suffix 是否使用文件类型后缀
 */
export function validateFileType(arr = [], file, suffix = true) {
  if (!file) {
    return false;
  }
  if (arr instanceof Array && arr.length === 0) {
    return true; // 不传不校验文件类型
  }
  const names = file?.name?.split('.');
  const fileSuffix = names?.length > 0 && names[names.length - 1];
  if (file.type) {
    if (suffix) {
      let values = [];
      arr.forEach((item) => {
        let val = fileTypeEnum[item];
        val = val.split(',');
        values = values.concat(val);
      });
      return values.includes(file.type) || arr.includes(fileSuffix);
    }
    return arr.includes(file.type);
  }
  if (!file.type && suffix) {
    const names = file.name.split('.');
    const fileSuffix = names.length > 0 && names[names.length - 1];
    return arr.includes(fileSuffix);
  }
  return false;
}

/**
 * 判断是否为压缩包格式
 * @param {*} file 当前文件
 * @param {Array} fileTypes 压缩包文件类型后缀
 */
export function isZip(file = {}, fileTypes = ['zip', 'rar']) {
  const { name } = file;
  const names = name.split('.');
  const fileSuffix = names.length > 0 && names[names.length - 1];
  return fileTypes.includes(fileSuffix);
}

/**
 * 校验文件
 * @param {*} v
 */
export function valiedateFile(v) {
  if (!v || (v instanceof Array && v.length === 0)) {
    return Promise.reject(new Error('请上传文件'));
  }
  return Promise.resolve();
}

/**
 * 获取文件预览地址
 * @param {*} key
 */
export function getDefaultPreFileUrl(fileKey, prefixUrl = '') {
  return `${window.location.origin}${prefixUrl}?fileKey=${fileKey}`;
}

/**
 * base64转文件流
 */
export function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export function downloadFile(url, name = '文件') {
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', name);
  a.setAttribute('target', '_blank');
  a.click();
}

/**
 * 获得文件流地址
 * @param {*} base64
 * @param {*} fileName
 * @param {*} suffix
 * @returns
 */
export function getFileUrlByBase64(base64, fileName, suffix = true) {
  let base64Str = base64;
  if (suffix && base64.indexOf('data:') === -1) {
    // 不存在类型前缀
    const names = fileName.split('.');
    const fileSuffix = names.length > 0 && names[names.length - 1];
    base64Str = `data:${fileBase64Enum[fileSuffix]};base64,${base64Str}`;
  }
  const blob = dataURLtoBlob(base64Str);
  blob.lastModifiedDate = new Date();
  blob.name = fileName;
  return URL.createObjectURL(blob);
}

/**
 * base64文件流下载
 * @param {Bloolean} suffix 是否使用文件后缀
 */
export function downloadFileByBase64(base64, fileName, suffix = true) {
  const url = getFileUrlByBase64(base64, fileName, suffix);
  downloadFile(url, fileName);
}

/**
 * 文件预览形式（下载/新标签）
 * @param { URL } url
 * @param {string} name
 * @param { ENUM } previewType PREVIEW_TYPE.DOWNLOAD.code / PREVIEW_TYPE.PREVIEW.code
 */
export function previewFile(url, name, previewType = PREVIEW_TYPE.DOWNLOAD.code) {
  const names = name.split('.');
  const fileSuffix = names.length > 0 && names[names.length - 1];
  const previewTypes = ['pdf', 'jpg', 'jpeg', 'png'];
  if (previewType === PREVIEW_TYPE.PREVIEW.code && previewTypes.includes(fileSuffix)) {
    return window.open(url, '_blank');
  }
  return downloadFile(url, name);
}
