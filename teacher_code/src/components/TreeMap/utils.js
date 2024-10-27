// 处理树形数据
export const handleTreeData = (data, parent) =>
  data.map((item, index) => {
    const level = parent?.level ? parent?.level + 1 : 1;

    return {
      ...item,
      level,
      isLast: index === data?.length - 1,
      isParentLast: parent?.isParentLast,
      children: item.children
        ? handleTreeData(item.children, {
            ...item,
            level,
            isParentLast: index === data?.length - 1,
          })
        : undefined,
    };
  });
