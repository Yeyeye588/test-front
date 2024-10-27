import CryptoJS from 'crypto-js';
import { CRYPTO_CONFIG } from '@/common/enum';

// 加密类型
export const CRYPTO_TYPE = {
  AES: 'AES',
  SHA: 'SHA',
  MD5: 'MD5',
};

/**
 * 加密
 * @param {*} word
 * @param {*} type 'AES'|'SHA'|'MD5'
 * @param {Object} config {jsKey, iv, salt}
 * @returns
 */
export const encode = (word, type = CRYPTO_TYPE.SHA, config = {}) => {
  if (type === CRYPTO_TYPE.SHA) {
    return encodeBySHA(word, { ...CRYPTO_CONFIG, ...config });
  }
  if (type === CRYPTO_TYPE.MD5) {
    return encodeByMD5(word, { ...CRYPTO_CONFIG, ...config });
  }
  return encodeByAES(word, {
    CryptoJSKey: config.jsKey || CRYPTO_CONFIG.jsKey,
    iv: config.iv || CRYPTO_CONFIG.iv,
  });
};

/**
 * AES解密
 * @param {*} word
 * @param {Object} config {jsKey, iv}
 * @returns
 */
export function decodeByAES(word, config) {
  let { CryptoJSKey = CRYPTO_CONFIG.jsKey, iv = CRYPTO_CONFIG.iv } = config;

  CryptoJSKey = CryptoJS.enc.Utf8.parse(CryptoJSKey);
  iv = CryptoJS.enc.Utf8.parse(iv);

  const encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  const decrypt = CryptoJS.AES.decrypt(srcs, CryptoJSKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}

/**
 * AES 加密
 * @param {*} word
 * @param {*} config {jsKey, iv}
 * @returns
 */
export function encodeByAES(word, config) {
  let { CryptoJSKey = CRYPTO_CONFIG.jsKey, iv = CRYPTO_CONFIG.iv } = config;

  CryptoJSKey = CryptoJS.enc.Utf8.parse(CryptoJSKey);
  iv = CryptoJS.enc.Utf8.parse(iv);

  const srcs = CryptoJS.enc.Utf8.parse(word);
  const encrypted = CryptoJS.AES.encrypt(srcs, CryptoJSKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString().toUpperCase();
}

export function encodeBySHA(word, config) {
  return CryptoJS.enc.Hex.stringify(CryptoJS.SHA512(config.salt + word));
}

/**
 * md5 加密 salt+word
 * @param {*} word
 * @param {*} config
 * @returns 大写密文
 */
export function encodeByMD5(word, config) {
  const str = typeof word === 'string' ? word : JSON.stringify(word);
  return CryptoJS.MD5(config.salt + str)
    .toString()
    .toLocaleUpperCase();
}
