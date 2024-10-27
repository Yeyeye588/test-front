import React from 'react';
import { LinkOutlined } from '@ant-design/icons';
import { formatVal } from '@/utils/format';
import { getToolTip, isEmptyArray } from '@/utils/utils';
import { getPreFileUrl } from '@/common/project';

const ApplyItem = React.memo(
  ({
    value,
    type = 'text',
    renderValue = (v) => {
      return formatVal(v);
    },
  }) => {
    if (type === 'file') {
      if (!value || isEmptyArray(value)) {
        return <div>暂无文件</div>;
      }
      if (value instanceof Array) {
        return value.map((item, i) => (
          <a
            onClick={() => {
              if (item?.url) {
                window.open(item.url);
                return;
              }
              if (item?.key) {
                window.open(getPreFileUrl(item.key));
              }
            }}
            style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
            key={item?.key || i}
          >
            <LinkOutlined style={{ marginRight: 4 }} />
            {getToolTip(item?.name, { width: '85%', style: { position: 'absolute', left: 20 } })}
          </a>
        ));
      }
      if (typeof value === 'object') {
        return (
          <a
            onClick={() => {
              if (item?.url) {
                window.open(item.url);
                return;
              }
              if (value?.key) {
                window.open(getPreFileUrl(value.key));
              }
            }}
            style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
          >
            <LinkOutlined style={{ marginRight: 4 }} />
            {getToolTip(value?.name, { width: '85%', style: { position: 'absolute', left: 20 } })}
          </a>
        );
      }
      return <div className="wordBreak">{renderValue(value)}</div>;
    }
    return <div className="wordBreak">{renderValue(value)}</div>;
  },
);

export default ApplyItem;
