import { message } from 'antd';
import { getProjectToken } from './utils';

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function fileRequest(
  url,
  options = { fileName: '文件.xlsx', fileNameInRes: false },
) {
  const tokenOptions = getProjectToken() ? { TOKEN_KEY: `${getProjectToken()}` } : {};
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  newOptions.headers = {
    ...tokenOptions,
    ...newOptions.headers,
  };
  let downloadName = options.fileName || '文件';

  const hide = message.loading(`${downloadName}开始下载...`, 0);

  return fetch(url, newOptions)
    .then((response) => {
      if (response && (response.status < 200 || response.status >= 300)) {
        throw new Error('请求失败');
      }
      const responseFileName = response.headers.get('Template-File-Name');
      if (options.fileNameInRes) {
        downloadName = decodeURIComponent(responseFileName);
      }
      response.blob().then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const aElement = document.createElement('a');
        aElement.href = blobUrl; // 设置a标签路径
        aElement.download = downloadName;
        aElement.click();
        window.URL.revokeObjectURL(blobUrl);
        hide();
        message.success(`${downloadName}下载完成`);
      });
    })
    .catch(() => {
      hide();
      message.error(`${downloadName}下载失败`);
      return '请求失败';
    });
}
