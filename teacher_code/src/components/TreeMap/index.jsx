import React, { useEffect, useState } from 'react';
import { isEmptyArray, flatten } from '@/utils/utils';
import TreeItem from './TreeItem';
import styles from './index.less';
import { handleTreeData } from './utils';

/**
 * 三级树结构
 * @param {*} data
 * @param {*} id 数据唯一标识符映射
 * @param {*} showLine 是否展示线条
 * @param {*} indentSize 每层缩进的宽度
 * @param {*} padding 叶子结点内边距
 * @param {*} lineColor 线条颜色
 * @param {*} iconWidthList icon宽度
 * @param {*} expandable 是否可以展开收起
 * @param {*} defaultExpandAllRows 是否默认展开所有行
 */
const TreeMap = React.memo(
  ({
    data = [],
    id = 'id',
    showLine = true,
    indentSize = 25,
    padding = 16,
    lineColor = 'rgba(0, 133, 153, 0.4)',
    iconWidthList = ['16px', '10px', '6px'],
    expandable = true,
    defaultExpandAllRows = true,
  }) => {
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    useEffect(() => {
      if (!isEmptyArray(data) && defaultExpandAllRows) {
        setExpandedRowKeys(flatten(data).map((item) => item[id]));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    // 渲染树形结构
    const treeDataRender = (treeData, parent) => {
      return treeData.map((item) => {
        return (
          <div key={item?.key} style={{ width: '100%' }}>
            <div
              className={styles.treeItem}
              style={{
                display:
                  !parent || expandedRowKeys.findIndex((val) => val === parent[id]) !== -1
                    ? 'block'
                    : 'none',
                padding: `${padding}px 0 ${padding}px ${
                  padding + indentSize * (item?.level - 1)
                }px`,
              }}
            >
              <TreeItem
                item={item}
                showLine={showLine}
                indentSize={indentSize}
                padding={padding}
                lineColor={lineColor}
                iconWidthList={iconWidthList}
                expandable={expandable}
                expanded={expandedRowKeys.findIndex((val) => val === item[id]) !== -1}
                expandedRowKeys={expandedRowKeys}
                changeExpandedRowKeys={(key) => setExpandedRowKeys(key)}
              >
                {item?.value}
              </TreeItem>
            </div>
            {item.children && treeDataRender(item.children, item)}
          </div>
        );
      });
    };

    return <div className={styles.treeList}>{treeDataRender(handleTreeData(data))}</div>;
  },
);

export default TreeMap;
