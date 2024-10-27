## BaseDebounceSelect 防抖选择器

### BaseDebounceSelect API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 值 |  | - |
| onChange | 改变值的回调函数 | `function` | `() => {}` |
| fieldNames | 对应后端返回的字段 label value 映射 | `{ label: 'region', value: 'code' }` | { label: 'region', value: 'code' } |
| placeholder | placeholder | `string` | - |
| fetchOptions | 请求的方法 | `function` | () => {} |
| selectCallBack | selectCallBack 选择后的回调 | `function` | () => {} |
| initFetch | 首次是否请求 | `boolean` | false |

其他可以引入 antd 自带 Select 默认参数，此处不做说明

### 使用方式

#### 1、使用

```jsx
import { message } from 'antd';
import BaseDebounceSelect from '@/components/BaseDebounceSelect';

export default () => {
  // 写一个自己的请求方法返回
  const fetchOptions = () => {
    return Promise.resolve([]);
  };

  return (
    <BaseDebounceSelect
      placeholder="请选择"
      fetchOptions={fetchOptions}
      fieldNames={{ label: 'label', value: 'value' }}
    />
  );
};
```
