import { mgop } from '@aligov/jssdk-mgop';
import { getProjectToken } from './utils';

export const mgopRequest = ({
  zwApi = '',
  data = {},
  queryParams = {},
  method = 'GET',
  isBuffer = false,
  dataType = 'JSON',
  noToken = true,
}) => {
  return new Promise((resolve, reject) => {
    const formatted = {
      api: zwApi,
      host: 'https://mapi.zjzwfw.gov.cn/',
      dataType,
      data: {
        ...queryParams,
        ...data,
      },
      type: method,
      isBuffer,
      appKey: ZW_APP_KEY,
      // 成功后的回调
      onSuccess: (res) => {
        if (res.code !== SUCCESS_CODE) {
          return reject(res);
        }
        return resolve(res);
      },
      // 请求失败后的回调
      onFail: (res) => {
        return reject(res);
      },
      ...(noToken ? {} : { header: { Authorization: `Bearer ${getProjectToken()}` } }),
    };
    mgop(formatted);
  });
};
