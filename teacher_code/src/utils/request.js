import { request as normalRequest } from '@umijs/max';
import { mgopRequest } from './mgop';
import { isGovENV } from './utils';


export default function request(url, options = {}) {
  const { zwApi = '' } = options || {};
  return isGovENV() && zwApi ? mgopRequest(options) : normalRequest(url, options);
}

