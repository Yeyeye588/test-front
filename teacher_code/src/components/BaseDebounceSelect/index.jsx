import React, { useMemo, useRef, useState } from 'react';
import { Empty, Select, Spin } from 'antd';
import { useMount } from 'ahooks';
import debounce from 'lodash/debounce';

/**
 *
 * @param {*} fetchOptions 请求的方法
 * @param {*} debounceTimeout 防抖时间
 * @param {*} fieldNames 对应字段映射
 * @param {*} selectCallBack 选择后的回调
 * @param {*} mode 模式 支持tags
 * @param {*} initFetch 是否首次也请求
 * @returns
 */
function BaseDebounceSelect({
  fetchOptions,
  debounceTimeout = 500,
  fieldNames = { label: 'label', value: 'value' },
  selectCallBack = () => {},
  mode,
  ...props
}) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);

  const [selectValue, setSelectValue] = useState(undefined);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value = '') => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value)
        .then((newOptions) => {
          if (fetchId !== fetchRef.current) {
            return;
          }

          setOptions(newOptions);
          setFetching(false);
        })
        .catch(() => {
          setFetching(false);
        });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  useMount(() => {
    if (props.initFetch) {
      debounceFetcher();
    }
  });

  const onSelect = (v) => {
    selectCallBack(v, options);
  };

  const blurHandle = () => {
    if (props.value) {
      props.onChange(props.value);
      selectCallBack(props.value, options);
    } else {
      props.onChange(selectValue);
    }
  };

  const searchHandle = (value) => {
    if (value) {
      props.onChange(value);
      setSelectValue(value);
      selectCallBack(value, options);
    }
  };

  if (mode === 'tags') {
    return (
      <Select
        allowClear
        showSearch
        filterOption={false}
        labelInValue={false}
        fieldNames={fieldNames}
        onSearch={searchHandle}
        onFocus={() => debounceFetcher()}
        onSelect={onSelect}
        notFoundContent={
          fetching ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }
        value={selectValue}
        onBlur={blurHandle}
        {...props}
        options={options.map((item) => ({
          [fieldNames.label]: item[fieldNames.label],
          [fieldNames.value]: item[fieldNames.value],
        }))}
      />
    );
  }

  return (
    <Select
      showSearch
      filterOption={false}
      labelInValue={false}
      fieldNames={fieldNames}
      onSearch={debounceFetcher}
      onFocus={() => debounceFetcher()}
      onSelect={onSelect}
      notFoundContent={
        fetching ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      }
      mode={mode}
      {...props}
      options={options.map((item) => ({
        [fieldNames.label]: item[fieldNames.label],
        [fieldNames.value]: item[fieldNames.value],
      }))}
    />
  );
}

export default BaseDebounceSelect;
