# 穿梭框组件

### 一、参数

```js
// 穿梭框类型
const TRANSFER_TYPE = {
  NOMAL: {
    code: 'NORMAL',
    desc: '常见',
  },
  TREE: {
    code: 'TREE',
    desc: '树级',
  },
  TABLE: {
    code: 'TABLE',
    desc: '表格',
  },
  CUSTOM: {
    code: 'CUSTOM',
    desc: '自定义',
  },
};
```

```javascript
  {
    value = [],
    onChange = () => {},
    data = [], // 穿梭框数据
    showSearch = { // 是否显示搜索
      left: false,
      right: false,
    },
    type = TRANSFER_TYPE.NOMAL.code, // 穿梭框类型
    treeProps = {},
    tableProps = {},
    searchProps = {}, // 搜索框属性
    onSearch = defaultSearch, // 自定义搜索项，默认搜索title文本匹配
    render = (item) => item.title, // 展示内容自定义
    oneWay = false, // 是否开启单向
    pagination = false, // 展示分页，仅支持Boolean
    pageSize = 10, // 展示几条记录
    renderLeftColumn, // 左侧自定义
    renderRightColumn, // 右侧自定义
    readonly = false, // 只读模式
    renderText = defaultRenderText, // 只读模式内容渲染
    ...restProps // 其余transfer属性
  }
```

###### 通用参数

- data
- pagination
- listStyle
- oneWay
- showSearch
- 穿梭框本身属性

### 二、util 方法支持

提供`mockTransferData`造点假数据

### 三、示例

- 1.通用参数穿梭框

```javascript
<BaseTransfer
  data={mockTransferData()}
  listStyle={{ height: 420, width: 250 }} // 可以不写，写了width就固定宽度
/>
```

- 2.树级穿梭框

  - 默认为不受控树

  ```js
  <BaseTransfer
    data={mockTransferData(TRANSFER_TYPE.TREE.code, 3)}
    type={TRANSFER_TYPE.TREE.code}
  />
  ```

  - 受控树

  ```js
  <BaseTransfer
    data={mockTransferData(TRANSFER_TYPE.TREE.code, 3)}
    type={TRANSFER_TYPE.TREE.code}
    treeProps={{
      checkStrictly: false,
    }}
  />
  ```

- 3.表格穿梭框

```
<BaseTransfer
  data={mockTransferData(TRANSFER_TYPE.NOMAL.code, 200)}
  type={TRANSFER_TYPE.TABLE.code}
  tableProps={{
    columns: [],
  }}
  pagination // 开启分页
/>
```

- 4.单向穿梭框

```js
<BaseTransfer data={mockTransferData()} oneWay />
```

- 5.自定义穿梭框

```js
  const renderTransferColumn = (itemProps, currentPageData) => {
    const { onItemSelect, selectedKeys, disabled } = itemProps;
    return (
      <>
        {currentPageData.map((item) => (
          <div
            key={item.key}
            className={`${styles.transferCardItem} ${
              (disabled || item.disabled) && styles.disabled
            } ${selectedKeys.includes(item.key) && styles.selected}`}
            onClick={() => {
              if (disabled || item.disabled) {
                return;
              }
              onItemSelect(item.key, !selectedKeys.includes(item.key));
            }}
          >
            {item.title}
          </div>
        ))}
      </>
    );
  };
  ...
  return (
  <BaseTransfer
    data={mockTransferData()}
    type={TRANSFER_TYPE.CUSTOM.code}
    renderLeftColumn={renderTransferColumn}
    renderRightColumn={renderTransferColumn}
  />
  )

```

其中若不需要自定义，不传对应侧的方法就行，如右侧不需要自定义`renderRightColumn`不需要传递

`renderLeftColumn`和`renderLeftColumn`都会有三个入参

```
itemProps: {
  direction, // 渲染列表的方向 left|right
  disabled, // 是否禁用列表
  filteredItems, // 过滤后的数据
  selectedKeys, // 选中的条目
  onItemSelect, // 勾选条目
  onItemSelectAll, // 勾选一组条目
},
currentPageData: [], // 分页后当前页数据，如没有开启即为filterData
filterData: [], // 搜索后的数据
```

- 6.自定义穿梭框可读文本

```
 <BaseTransfer
  data={mockTransferData()}
  readonly
  renderText={(arr, keys) => (
    <>
      {arr
        ?.filter((v) => keys.includes(v.key))
        ?.map((v) => (
          <Tag key={v.key}>{v.title}</Tag>
        ))}
    </>
  )}
/>
```

`renderText`提供两个参数，可选数据项 data 和当前已选项 targetKeys,可进行筛选匹配得到对应的数据，进行自定义 dom;默认为匹配对应 key 渲染 title，以分号分割。
