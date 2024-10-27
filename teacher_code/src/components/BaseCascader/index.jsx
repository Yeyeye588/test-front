import React, { useEffect, useState } from 'react';
import { Cascader, message } from 'antd';

/**
 * @description 级联选择器
 * @isFetch 是否通过动态请求的方式 请求数据接口，如果为false，需要默认传入defaultOptions 字段
 * @fieldNames 对应后端返回的字段 label value 映射
 * @fetchQuery 获取每一级的请求的参数
 * @fetchCodeToName 将回填时需要将value转为中文，需要后端有对应接口转化
 */
export default ({
  placeholder,
  value,
  onChange = () => {},
  isFetch = true,
  fetchQuery = () => {},
  fetchCodeToName = () => {},
  fieldNames = { label: 'region', value: 'code' },
  searchCodeName = 'code',
  defaultOptions = [],
  ...props
}) => {
  const [options, setoptions] = useState(defaultOptions);
  const [defaultValue, setDefaultValue] = useState([]);
  const [fetched, setFetched] = useState(false);

  const loadData = (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    fetchQuery({ [searchCodeName]: targetOption.value })
      .then((res) => {
        if (res.data && res.data.length === 0) {
          targetOption.isLeaf = true;
        }
        targetOption.loading = false;
        const cityArr = [];
        res.data.forEach((item) => {
          cityArr.push({
            value: item?.[fieldNames.value],
            label: item?.[fieldNames.label],
            isLeaf: item.isLeaf || false,
          });
        });
        targetOption.children = cityArr;
        setoptions([...options]);
        setFetched(true);
      })
      .catch((err) => {
        message.error(err);
      });
  };

  useEffect(() => {
    if (value && isFetch) {
      fetchCodeToName({
        [searchCodeName]: value?.join('.') || '',
      }).then((res) => {
        setDefaultValue(res.data || []);
      });
    }
    if (isFetch) {
      // 初始请求首次的列表
      fetchQuery({
        // 根据自己的请求的参数来定制
        // [searchCodeName]: 1,
      })
        .then((res) => {
          const provinceArr = [];
          res?.data?.forEach((item) => {
            provinceArr.push({
              value: item?.[fieldNames.value],
              label: item?.[fieldNames.label],
              isLeaf: false,
            });
          });
          setoptions(provinceArr);
        })
        .catch((err) => {
          message.error(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayRender = (label) => {
    if (fetched) {
      return label.join(' / ');
    }
    return defaultValue.join(' / ');
  };

  const moreProps = isFetch
    ? {
        displayRender,
        defaultValue,
        loadData,
      }
    : {};

  return (
    <Cascader
      options={options}
      changeOnSelect
      onChange={onChange}
      placeholder={placeholder}
      value={value}
      {...moreProps}
      {...props}
    />
  );
};
