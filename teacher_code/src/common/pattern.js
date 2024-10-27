/**
  EN: 字母,
  UPPER_EN: 大写字母,
  LOWER_EN: 小写字母,
  PHONE: 手机号,
  INT: 整数
  POS_INT: 正整数,
  NOT_NEG_INT: 非负整数,
  FLOAT_TWO: 最多两位浮点数,
  WHITE_SPACE: 空格符,
  CH: 汉字
  CH_EN: 汉字+字母,
  CH_EN_NUM: 汉字+字母+数字,
  EN_NUM: 字母+数字,
  EMAIL: 邮箱地址
  CREDIT_CODE: 统一社会信用代码,
  IMAGE: 图片链接地址,
  BANK_CARD: 银行卡号,
  CH_NAME: 中文名,
  EN_NAME: 英文名,
  PASSPORT: 护照，
  URL: 网址，
  POSTCODE: 邮政编码
 */
export const PATTERN = {
  EN: /^[A-Za-z]+$/,
  UPPER_EN: /^[A-Z]+$/,
  LOWER_EN: /^[a-z]+$/,
  PHONE:
    /^(?:\+?86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[0135-9]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0135-9]\d{2}|6[2567]\d{2}|4[579]\d{2})\d{6}$/,
  INT: /^-?[1-9]\d*$/,
  POS_INT: /^([1-9]\d*)$/,
  NOT_NEG_INT: /^(0|[1-9]\d*)$/,
  FLOAT_TWO: /(^(0|[1-9]\d*)$)|(^[0-9]\d*\.{1}[0-9]{1,2}$)/,
  WHITE_SPACE: /\s/,
  CH: /^[\u4e00-\u9fa5]+$/,
  CH_NUM: /^[\u4e00-\u9fa5_0-9]+$/,
  CH_EN: /^[\u4e00-\u9fa5_a-zA-Z]+$/,
  CH_EN_NUM: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
  EN_NUM: /^[a-zA-Z0-9]+$/,
  EMAIL: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
  CREDIT_CODE: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/,
  IMAGE: /^https?:\/\/(.+\/)+.+(\.(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif))$/i,
  BANK_CARD: /^[1-9]\d{9,29}$/,
  CH_NAME: /^(?:[\u4e00-\u9fa5·]{2,16})$/,
  EN_NAME: /(^[a-zA-Z]{1}[a-zA-Z\s]{0,20}[a-zA-Z]{1}$)/,
  PASSPORT:
    /(^[EeKkGgDdSsPpHh]\d{8}$)|(^(([Ee][a-fA-F])|([DdSsPp][Ee])|([Kk][Jj])|([Mm][Aa])|(1[45]))\d{7}$)/,
  URL: /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
  POSTCODE: /^(0[1-7]|1[0-356]|2[0-7]|3[0-6]|4[0-7]|5[1-7]|6[1-7]|7[0-5]|8[013-6])\d{4}$/,
  FUZZY_PHONE_TEL: /(^(?:\d{3}-)?\d{8}$|^(?:\d{4}-)?\d{7,8}$)|(^(?:(?:\+|00)86)?1\d{10}$)/,
  TEL: /^(?:(?:\d{3}-)?\d{8}|^(?:\d{4}-)?\d{7,8})(?:-\d+)?$/,
};
