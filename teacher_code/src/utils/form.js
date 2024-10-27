import { PromiseAll, readProjectItem } from './utils';

const handleValues = (data) => {
  let newData = {};
  data?.forEach((item) => {
    newData = {
      ...newData,
      ...item,
    };
  });
  return newData;
};

export const validateFieldsForms = ({
  forms = [],
  collapseRef = '',
  collapseCallBack = () => {},
}) => {
  return PromiseAll(Object.keys(forms).map((f) => forms[f].validateFields()))
    .then((values) => {
      const payloadFinal = handleValues(values);
      return Promise.resolve(payloadFinal);
    })
    .catch((err) => {
      const errorName = err?.errorFields[0]?.name.toString();
      Object.keys(forms).forEach((f) => {
        const valueArr = forms[f].getFieldsValue();
        const keys = Object.keys(valueArr);
        if (keys?.includes(errorName) || keys?.includes(errorName?.split(',')[0])) {
          if (forms[f] === collapseRef) {
            collapseCallBack();
          }
          const errorNameArr = errorName.split(',');
          forms[f]?.scrollToField(errorNameArr, { block: 'center' });
        }
      });
      return Promise.reject();
    });
};

export const setForms = (forms, payload) => {
  PromiseAll(Object.keys(forms).map((f) => forms[f].setFieldsValue(payload)));
};

export const readHashSetForms = (Hash, forms) => {
  const payload = readProjectItem(Hash);
  if (payload) {
    setForms(forms, payload);
  }
};

/**
 * 时间数组拆分
 * @param {*} arr
 * @param {*} startAttr
 * @param {*} endAttr
 * @returns
 */
export const getStartAndEnd = (arr = [], startAttr = 'startTime', endAttr = 'endTime') => {
  if (Array.isArray(arr) && arr.length >= 1) {
    return {
      [startAttr]: arr[0],
      [endAttr]: arr[1],
    };
  }
  return {
    [startAttr]: '',
    [endAttr]: '',
  };
};
