import React from 'react';
import cn from 'classnames';
import { isEmptyArray, flatten } from '@/utils/utils';
import styles from './index.less';

/**
 * 叶子结点
 * @param {*} item
 * @param {*} id 数据唯一标识符映射
 * @param {*} indentSize 每层缩进的宽度
 * @param {*} padding 叶子结点内边距
 * @param {*} lineColor 线条颜色
 * @param {*} iconWidthList icon宽度
 * @param {*} showLine 是否展示线条
 * @param {*} expandable 是否可以展开收起
 * @param {*} expanded 叶子结点是否展开
 * @param {*} expandedRowKeys 展开的行
 * @param {*} changeExpandedRowKeys 点击展开图标时触发
 * @param {*} children
 */
const TreeItemDom = React.memo(
  ({
    item = {},
    id = 'id',
    indentSize = 25,
    padding = 16,
    lineColor = 'rgba(0, 133, 153, 0.4)',
    iconWidthList = ['16px', '10px', '6px'],
    showLine = true,
    expandable = true,
    expanded = true,
    expandedRowKeys = [],
    changeExpandedRowKeys = () => {},
    children,
  }) => {
    return (
      <div className={styles.treeItemBox}>
        <span
          className={styles[`name${item?.level}`]}
          style={{
            '--showLine': showLine ? 'block' : 'none',
            '--padding': `${padding}px`,
            '--indentSize': `${indentSize}px`,
            '--circle1': item?.iconStyle?.width || iconWidthList[0],
            '--circle2': item?.iconStyle?.width || iconWidthList[1] || iconWidthList[0],
            '--circle3':
              item?.iconStyle?.width || iconWidthList[2] || iconWidthList[1] || iconWidthList[0],
            '--lineColor': lineColor,
            '--lastLineHeight': item?.isLast ? '50%' : '100%',
            '--laseParentHeight': item?.isParentLast ? '50%' : '100%',
            '--childLeftBorderColor': item?.isParentLast ? 'transparent' : lineColor,
            '--parentBorderColor': item?.children && expanded ? lineColor : 'transparent',
          }}
        >
          <span
            className={cn(styles.circle, styles[`level${item?.level}`])}
            style={{
              ...item?.iconStyle,
              cursor: item?.children && expandable ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (!isEmptyArray(item?.children) && expandable) {
                const childrenKeys = flatten(item?.children).map((val) => val[id]);
                changeExpandedRowKeys(
                  expanded
                    ? expandedRowKeys.filter((val) => {
                        return (
                          val !== item[id] && !(childrenKeys.findIndex((m) => m === val) !== -1)
                        );
                      })
                    : [...expandedRowKeys, item[id]],
                );
              }
            }}
          />
          <span className={styles.title}>{item?.name}</span>
        </span>
        {children && <span className={styles.value}>{children}</span>}
      </div>
    );
  },
);

export default TreeItemDom;
