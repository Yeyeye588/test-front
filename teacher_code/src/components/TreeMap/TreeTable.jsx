import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { isEmptyArray, flatten } from '@/utils/utils';
import TreeItem from './TreeItem';
import styles from './index.less';
import { handleTreeData } from './utils';

/**
 * 三级树结构表格
 * @param {*} tableKey 用于表格更新渲染
 * @param {*} id 数据唯一标识符映射
 * @param {*} treeKey 需要展示树形结构的字段
 * @param {*} columns
 * @param {*} showLine 是否展示线条
 * @param {*} indentSize 每层缩进的宽度
 * @param {*} padding 叶子结点内边距
 * @param {*} lineColor 线条颜色
 * @param {*} iconWidthList icon宽度
 * @param {*} expandable 是否可以展开收起
 * @param {*} defaultExpandAllRows 是否默认展开所有行
 * @param {*} tableProps
 */
const TreeTable = React.memo(
  ({
    tableKey,
    id = 'id',
    treeKey = 'name',
    columns = [],
    showLine = true,
    indentSize = 25,
    padding = 16,
    lineColor = 'rgba(0, 133, 153, 0.4)',
    iconWidthList = ['16px', '10px', '6px'],
    expandable = true,
    defaultExpandAllRows = true,
    tableProps = {},
  }) => {
    const [newColumns, setNewColumns] = useState([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    useEffect(() => {
      if (!isEmptyArray(columns)) {
        setNewColumns(
          columns.map((item) => {
            if (item.dataIndex === treeKey) {
              return {
                ...item,
                render: (v, record) => (
                  <TreeItem
                    item={record}
                    showLine={showLine}
                    indentSize={indentSize}
                    padding={padding}
                    lineColor={lineColor}
                    iconWidthList={iconWidthList}
                    expandable={expandable}
                    expanded={expandedRowKeys.findIndex((val) => val === record[id]) !== -1}
                  />
                ),
              };
            }
            return item;
          }),
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expandedRowKeys]);

    useEffect(() => {
      if (!isEmptyArray(tableProps?.dataSource) && defaultExpandAllRows) {
        setExpandedRowKeys(flatten(tableProps?.dataSource).map((item) => item[id]));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableProps?.dataSource]);

    return (
      <div className={styles.treeTable}>
        <Table
          key={tableKey}
          columns={newColumns}
          rowKey="id"
          {...tableProps}
          dataSource={handleTreeData(tableProps?.dataSource)}
          indentSize={indentSize}
          defaultExpandAllRows={defaultExpandAllRows}
          expandable={
            expandable
              ? {
                  onExpandedRowsChange: (rowKeys) => {
                    expandable && setExpandedRowKeys(rowKeys);
                  },
                }
              : {
                  expandIcon: () => null,
                }
          }
          className="myTable"
        />
      </div>
    );
  },
);

export default TreeTable;
