/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Form } from 'antd';
import { EditableProTable } from '@ant-design/pro-components';
import { isEmptyArray } from '@/utils/utils';
import styles from './index.less';

const BaseEditableTable = React.memo(
  forwardRef(
    (
      {
        listData = [],
        columns = [],
        rowKey = 'id',
        rowSpanArr = [],
        readonly = false,
        recordCreatorProps = false,
        editableProps = {},
        columnEmptyText = '-', // 空值时的显示内容
        onChange = () => {},
        ...restProps
      },
      ref,
    ) => {
      const [editableKeys, setEditableRowKeys] = useState([]);
      const [dataSource, setDataSource] = useState([]);
      const [editForm] = Form.useForm();

      useImperativeHandle(ref, () => ({
        validateFields: () => editForm.validateFields(),
      }));

      // 处理数据单元格合并
      const handleDataSource = (data) => {
        data.forEach((item, i) => {
          data.forEach((val, n) => {
            rowSpanArr.forEach((rowSpanMap) => {
              // 需要合并key值对应数据存在且相同
              if (
                rowSpanMap.key &&
                item[rowSpanMap.key] &&
                val[rowSpanMap.key] &&
                item[rowSpanMap.key] === val[rowSpanMap.key] &&
                n > i &&
                val?.[rowSpanMap.rowSpanName] !== 0
              ) {
                item[rowSpanMap.rowSpanName] = item?.[rowSpanMap.rowSpanName]
                  ? item?.[rowSpanMap.rowSpanName] + 1
                  : 2;
                val[rowSpanMap.rowSpanName] = 0;
              }
            });
          });
        });
        return data;
      };

      useEffect(() => {
        setEditableRowKeys(dataSource?.map((item) => item[rowKey]));
      }, [dataSource]);

      useEffect(() => {
        if (isEmptyArray(listData)) {
          !isEmptyArray(dataSource) && setDataSource([]);
          return;
        }
        setDataSource(isEmptyArray(rowSpanArr) ? listData : handleDataSource(listData));
      }, [listData]);

      return (
        <div className={styles.editable}>
          <EditableProTable
            controlled
            columns={columns}
            value={dataSource}
            rowKey={rowKey}
            recordCreatorProps={recordCreatorProps}
            editable={
              readonly
                ? false
                : {
                    form: editForm,
                    type: 'multiple',
                    editableKeys,
                    onValuesChange: (record, recordList) => {
                      setDataSource(recordList);
                      onChange(recordList);
                    },
                    onChange: setEditableRowKeys,
                    ...editableProps,
                  }
            }
            columnEmptyText={columnEmptyText}
            {...restProps}
          />
        </div>
      );
    },
  ),
);

export default BaseEditableTable;
