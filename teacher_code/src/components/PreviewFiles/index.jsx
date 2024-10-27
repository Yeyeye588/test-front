import React, { useState } from 'react';
import { Dropdown, Menu } from 'antd';
import { DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import { isEmptyArray } from '@/utils/utils';
import { downloadFile as defaultDownloadFile } from '@/common/project';
import styles from './index.less';

const PreviewFiles = React.memo(
  ({
    data = [],
    disabled = false,
    style = {},
    name = 'originName',
    fileKey = 'fileId',
    index = 0,
    deleteFile,
    canEdit = 0,
    text = '查看附件',
    action = '/common/file/download?fileKey=',
    downloadFile = defaultDownloadFile,
    children,
    ...props
  }) => {
    const [visible, setVisible] = useState(false);
    const handleDeleteFile = (id) => {
      deleteFile(id, index);
    };

    return isEmptyArray(data) ? (
      <span style={style}>-</span>
    ) : (
      <Dropdown
        open={visible}
        disabled={disabled}
        dropdownRender={() => (
          <Menu onMouseLeave={() => setVisible(false)}>
            {data.map((item) => {
              return (
                <Menu.Item key={item[fileKey]} className={styles.menuItemWrapper}>
                  <div className={styles.menuItemContent}>
                    <span>
                      <PaperClipOutlined className={styles.fileIcon} />
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => downloadFile(`${action}${item[fileKey]}`, item[name])}
                      >
                        {item[name]}
                      </a>
                    </span>

                    {Number(canEdit) && (
                      <DeleteOutlined
                        className={styles.deleteIcon}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                          handleDeleteFile(item[fileKey]);
                        }}
                      />
                    )}
                  </div>
                </Menu.Item>
              );
            })}
            <div className={styles.childrenContent} key="action">
              {children}
            </div>
          </Menu>
        )}
        {...props}
      >
        <span className={styles.tipText} style={style} onMouseEnter={() => setVisible(true)}>
          {text}
        </span>
      </Dropdown>
    );
  },
);

export default PreviewFiles;
