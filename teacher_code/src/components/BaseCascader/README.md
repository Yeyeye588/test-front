## BaseCascader 级联组件

### BaseCascader API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 值 |  | - |
| onChange | 改变值的回调函数 | `function` | `() => {}` |
| isFetch | 是否通过动态请求的方式 请求数据接口，如果为 false，需要默认传入 defaultOptions 字段 | `boolean` | true |
| defaultOptions | 默认 options 一般在 isFetch 为 false 时出传入 | `array` | [] |
| fieldNames | 对应后端返回的字段 label value 映射 | `{ label: 'region', value: 'code' }` | { label: 'region', value: 'code' } |
| placeholder | placeholder | `string` | - |
| fetchQuery | 获取每一级的请求的参数） | `function` | () => {} |
| fetchCodeToName | 将回填时需要将 value 转为中文，需要后端有对应接口转化） | `function` | () => {} |

其他可以引入 antd 自带 Cascader 默认参数，此处不做说明

### 使用方式

#### 1、普通不引入请求

```jsx
import { message } from 'antd';
import BaseCascader from '@/components/BaseCascader';

export default () => {
  const defaultOptions = [
    {
      value: 'zhejiang',
      label: 'Zhejiang',
      children: [
        {
          value: 'hangzhou',
          label: 'Hangzhou',
          children: [
            {
              value: 'xihu',
              label: 'West Lake',
            },
          ],
        },
      ],
    },
  ];

  return (
    <BaseCascader
      placeholder="请选择"
      defaultOptions={defaultOptions}
      isFetch={false}
      fieldNames={{ label: 'label', value: 'value' }}
    />
  );
};
```

#### 2、引入请求

```jsx
import { useState } from 'react';
import { message } from 'antd';
import BaseCascader from '@/components/BaseCascader';

export default () => {
  const fetchRegionQuery = () => {
    return Promise.resolve({
      data: [{ code: '1', region: '中国', child: null, isLeaf: true }],
    });
  };

  const fetchRegionCodeToName = () => {
    return Promise.resolve({
      data: ['中国'],
    });
  };

  const [value, setValue] = useState([1]);

  return (
    <BaseCascader
      value={value}
      onChange={(v) => setValue(v)}
      placeholder="请选择"
      isFetch={true}
      fetchQuery={fetchRegionQuery}
      fetchCodeToName={fetchRegionCodeToName}
      fieldNames={{ label: 'region', value: 'code' }}
    />
  );
};
```
