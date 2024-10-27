import { flatten } from '@/utils/utils';

// 菜单树类型
export const TREE_TYPE = {
  DEFAULT: {
    code: 'DEFAULT',
    desc: '默认',
  },
  CUSTOM: {
    code: 'CUSTOM',
    desc: '自定义',
  },
};

/**
 * 获取所有叶子节点
 * @param {*} tree
 * @returns
 */
export const getAllLeaves = (tree) => flatten(tree).map((item) => item.key);
