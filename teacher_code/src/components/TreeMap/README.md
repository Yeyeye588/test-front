## TreeMap 树级线性结构组件

包括 普通树级线性结构展示 和 表格内树级线性结构展示

### 普通树级线性结构展示 TreeMap API

| 参数                 | 说明               | 类型     | 默认值                  |
| -------------------- | ------------------ | -------- | ----------------------- |
| data                 | 树形结构数据       | array    | []                      |
| id                   | 数据唯一标识符映射 | string   | id                      |
| showLine             | 是否展示线条       | boolean  | true                    |
| indentSize           | 每层缩进的宽度     | number   | 25                      |
| padding              | 叶子结点内边距     | number   | 16                      |
| lineColor            | 线条颜色           | string   | rgba(0, 133, 153, 0.4)  |
| iconWidthList        | 每一级的 icon 宽度 | function | ['16px', '10px', '6px'] |
| expandable           | 是否可以展开收起   | boolean  | true                    |
| defaultExpandAllRows | 是否默认展开所有行 | boolean  | true                    |

### 使用方式

```jsx
import TreeMap from '@/components/TreeMap';

export default () => {
  // 数据以id为唯一标识符
  const data = [
    {
      id: 1,
      name: '河南投资集团有限公司',
      age: 60,
      address: 'New York No. 1 Lake Park',
      children: [
        {
          id: 11,
          name: '河南省天然气管网有限公司',
          age: 42,
          address: 'New York No. 2 Lake Park',
        },
        {
          id: 12,
          name: '郑州豫能热电有限公司',
          age: 42,
          address: 'New York No. 2 Lake Park',
        },
        {
          id: 13,
          name: '河南豫能控股股份有限公司',
          age: 30,
          address: 'New York No. 3 Lake Park',
          children: [
            {
              id: 131,
              name: '濮阳豫能发电有限责任公司',
              age: 16,
              address: 'New York No. 3 Lake Park',
            },
            {
              id: 132,
              name: '鹤壁鹤淇发电有限责任公司',
              age: 16,
              address: 'New York No. 3 Lake Park',
            },
          ],
        },
        {
          id: 14,
          name: '焦作天力电力投资有限公司',
          age: 42,
          address: 'New York No. 2 Lake Park',
        },
        {
          id: 15,
          name: '河南省电力集团有限公司',
          age: 30,
          address: 'New York No. 3 Lake Park',
          children: [
            {
              id: 151,
              name: '222',
              age: 16,
              address: 'New York No. 3 Lake Park',
            },
            {
              id: 152,
              name: '333',
              age: 16,
              address: 'New York No. 3 Lake Park',
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: '国网河南省电力公司',
      age: 32,
      address: 'Sydney No. 1 Lake Park',
    },
  ];

  return <TreeMap data={data} />;
};
```

### 表格内树级线性结构 TreeTable API

| 参数                 | 说明                             | 类型     | 默认值                  |
| -------------------- | -------------------------------- | -------- | ----------------------- |
| tableKey             | 表格唯一标识符，用于表格更新渲染 | string   | -                       |
| id                   | 表格数据唯一标识符映射           | string   | id                      |
| treeKey              | 表格中需要展示树形结构的列表字段 | string   | name                    |
| columns              | 表格列表字段配置                 | array    | []                      |
| showLine             | 是否展示线条                     | boolean  | true                    |
| indentSize           | 每层缩进的宽度                   | number   | 25                      |
| padding              | 叶子结点内边距                   | number   | 16                      |
| lineColor            | 线条颜色                         | string   | rgba(0, 133, 153, 0.4)  |
| iconWidthList        | 每一级的 icon 宽度               | function | ['16px', '10px', '6px'] |
| expandable           | 是否可以展开收起                 | boolean  | true                    |
| defaultExpandAllRows | 是否默认展开所有行               | boolean  | true                    |
| tableProps           | 剩余表格配置                     | object   | {}                      |

### 使用方式

```jsx
import TreeTable from '@/components/TreeMap/TreeTable';
import { useRequest } from '@umijs/max';
import { useSearchFormTable } from '@/utils/hooks';
import { fetchRuleList } from '@/services/api';

export default () => {
  ...

  const { run: fetchTableList, data: listData } = useRequest((v) => fetchRuleList(v), {
    manual: true,
    onError: (res) => {
      message.error(res?.message || '请求失败');
    },
    // 数据处理
    formatResult: ({ data: res }) => {
      const arr = res?.items.map((item, index) => ({
        ...item,
        orderNum: index + 1,
        rowKey: `rowKey-${item?.id}-${index + 1}`,
      }));
      return {
        ...res,
        items: arr,
      };
    },
  });

  const getTableData = ({ current = 1, pageSize = 10 }, formData) => {
    const payload = {
      pageNo: current,
      pageSize,
      ...formData,
    };
    if (saveRoutingCache) {
      replaceRoute(payload);
    }
    return fetchTableList(payload);
  };

  const {
    tableProps,
    refresh,
    search: { reset, submit },
  } = useSearchFormTable(getTableData, {
    form,
    total: listData?.total,
    dataSource: listData?.items,
    defaultParams: saveRoutingCache
      ? [
          {
            current: queryParams?.pageNo || 1,
            pageSize: queryParams?.pageSize || 10,
          },
          queryParams,
        ]
      : [
          {
            current: 1,
            pageSize: 10,
          },
        ],
  });


  const columns = [
    {
      title: '规则名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'address',
    },
    ...
  ];
  ...

  return (
    ...
    // 将普通Table换成TreeTable组件，更多表格配置放tableProps中传入
    <TreeTable
      tableKey={new Date().getTime()}
      treeKey="name"
      columns={columns}
      rowKey="rowKey"
      className="myTable"
      tableProps={{ ...tableProps }}
      padding={8}
    />
    ...
  );
};
```
