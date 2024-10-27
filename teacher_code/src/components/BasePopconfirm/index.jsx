import React, { useState } from 'react';
import { Popconfirm } from 'antd';

const BasePopconfirm = React.memo(
  ({
    loading = false,
    title = '确认删除该条记录吗',
    okText = '确定',
    cancelText = '取消',
    okType = 'primary',
    handleConfirm = () => {},
    children,
    ...props
  }) => {
    const [visible, setVisible] = useState(false);
    const handlePopConfirm = () => {
      Promise.resolve(handleConfirm()).then(() => {
        setVisible(false);
      });
    };
    return (
      <Popconfirm
        title={title}
        okText={okText}
        cancelText={cancelText}
        okType={okType}
        onConfirm={handlePopConfirm}
        open={visible}
        okButtonProps={{ loading }}
        onCancel={() => setVisible(false)}
        {...props}
      >
        <div onClick={() => setVisible(true)}>{children}</div>
      </Popconfirm>
    );
  },
);

export default BasePopconfirm;
