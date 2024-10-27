import { isEmptyArray } from '@/utils/utils';

// 穿梭框类型
export const TRANSFER_TYPE = {
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

/**
 * mock 数据
 * @param {*} type
 * @param {*} len
 * @param {*} level
 * @param {*} parentKey
 * @returns
 */
export function mockTransferData(
  type = TRANSFER_TYPE.NOMAL.code,
  len = 20,
  level = 1,
  parentKey = '',
) {
  const tempMockData = [];
  for (let i = 0; i < len; i++) {
    if (type === TRANSFER_TYPE.TREE.code) {
      const key = `${parentKey}-${i + 1}`;
      const data = {
        key,
        title: `content${key}`,
        description: `description of content${key}`,
        checkable: level === 3,
        children: level < 3 ? mockTransferData(type, 4 - level, level + 1, key) : [],
      };
      tempMockData.push(data);
      continue;
    }
    const data = {
      key: i.toString(),
      title: `content${i + 1}`,
      description: `description of content${i + 1}`,
      chosen: i % 2 === 0,
      disabled: i % 5 === 0,
    };
    tempMockData.push(data);
  }
  return tempMockData;
}

/**
 * 字符匹配展开树key
 * @param {*} value
 * @param {*} tree
 * @param {*} expandKeys
 * @returns
 */
export function getExpandKeys(value, tree, expandKeys = []) {
  if (isEmptyArray(tree)) {
    return [];
  }
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node?.title?.indexOf(value) > -1) {
      // 相关文案类似匹配
      expandKeys.push(node.key);
    }
    if (node?.children) {
      getExpandKeys(value, node.children, expandKeys);
    }
  }
  return expandKeys;
}

/**
 * 被勾选的树内容改为禁用
 * @param {*} treeNodes
 * @param {*} checkedKeys 已选中keys
 * @returns
 */
export function generateTree(treeNodes = [], checkedKeys = []) {
  if (isEmptyArray(treeNodes)) {
    return [];
  }
  return treeNodes.map(({ children, ...props }) => ({
    ...props,
    disabled: props.disabled || checkedKeys.includes(props.key),
    children: generateTree(children, checkedKeys),
  }));
}

/**
 * 获得分页数据
 * @param {*} data
 * @param {*} page
 * @param {*} pageSize
 * @returns
 */
export function getPaginationData(data, page = 1, pageSize = 10) {
  if (isEmptyArray(data)) {
    return data;
  }
  return data.slice((page - 1) * pageSize, page * pageSize);
}
