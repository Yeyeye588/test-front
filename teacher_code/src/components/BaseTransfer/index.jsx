import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Checkbox, Empty, Input, Pagination, Table, Transfer, Tree } from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { difference } from 'lodash';
import { isEmptyArray } from '@/utils/utils';
import styles from './index.less';
import { TRANSFER_TYPE, generateTree, getExpandKeys, getPaginationData } from './util';

function isChecked(selectedKeys, eventKey) {
  if (eventKey instanceof Array) {
    return difference(eventKey, selectedKeys).length > 0;
  }
  return selectedKeys.indexOf(eventKey) !== -1;
}

/**
 * 是否展示可搜索
 * @param {*} direction
 * @param {*} search
 * @returns
 */
function isShowSearch(direction = 'left', search) {
  if (typeof search === 'object') {
    return search[direction];
  }
  return search;
}

/**
 * 默认筛选
 * @param {*} direction
 * @param {*} value
 * @param {*} arr
 * @returns
 */
function defaultSearch(_, value, arr) {
  if (isEmptyArray(arr)) {
    return [];
  }
  return arr.filter((v) => v.title.indexOf(value) > -1);
}

/**
 * 默认展示
 * @param {*} arr
 * @param {*} keys
 * @returns
 */
function defaultRenderText(arr, keys) {
  return (
    arr
      ?.filter((v) => keys.includes(v.key))
      ?.map((v) => v.title)
      ?.join('；') || '-'
  );
}

const BaseTransfer = React.memo(
  ({
    value = [],
    onChange = () => {},
    data = [],
    showSearch = {
      left: false,
      right: false,
    },
    type = TRANSFER_TYPE.NOMAL.code,
    treeProps = {},
    tableProps = {},
    searchProps = {},
    onSearch = defaultSearch,
    render = (item) => item.title,
    oneWay = false,
    pagination = false,
    pageSize = 10, // 展示几条记录
    renderLeftColumn,
    renderRightColumn,
    readonly = false,
    renderText = defaultRenderText,
    ...restProps
  }) => {
    const [targetKeys, setTargetKeys] = useState(isEmptyArray(value) ? [] : value);
    const [selectKeys, setSelectKeys] = useState([]);
    const [searchValue, setSearchValue] = useState({ left: '', right: '' });
    const [paginationParams, setPaginationParams] = useState({
      left: { current: 1 },
      right: { current: 1 },
    });
    const paginationParamsRef = useRef({
      left: { current: 1 },
      right: { current: 1 },
    });
    const treeData = useMemo(() => generateTree(data, targetKeys), [data, targetKeys]);
    const [expandedKeys, setExpandedKeys] = useState(getExpandKeys('', treeData));
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const handleChange = (nextTargetKeys) => {
      setTargetKeys(nextTargetKeys);
      onChange(nextTargetKeys);
      setPaginationParams(paginationParamsRef.current);
    };

    const handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
      setSelectKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
    };

    useEffect(() => {
      if (isEmptyArray(targetKeys) && !isEmptyArray(value)) {
        setTargetKeys(value);
        setExpandedKeys(getExpandKeys('', treeData));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, treeData]);

    const handleLeftSearch = (e) => {
      const { value } = e.target;
      const newExpandedKeys = getExpandKeys(value, treeData);
      setExpandedKeys(newExpandedKeys);
      setSearchValue((v) => ({ ...v, left: value }));
      setAutoExpandParent(true);
      if (pagination) {
        setPaginationParams((v) => ({
          ...v,
          left: {
            current: 1,
          },
        }));
      }
    };
    const onExpand = (newExpandedKeys) => {
      setExpandedKeys(newExpandedKeys);
      setAutoExpandParent(false);
    };

    const renderLeftItem = (itemProps, currentPageData, filterData) => {
      const { onItemSelect, selectedKeys, disabled, direction, onItemSelectAll } = itemProps;
      const checkedKeys = [...selectedKeys, ...targetKeys];
      if (type === TRANSFER_TYPE.TREE.code) {
        const { checkStrictly = true } = treeProps || {};
        return (
          <div
            className="ant-transfer-list-content"
            style={{ height: isShowSearch(direction, showSearch) ? 'calc(100% - 56px)' : '100%' }}
          >
            <Tree
              blockNode
              checkable
              checkStrictly={checkStrictly}
              defaultExpandAll
              checkedKeys={checkedKeys}
              treeData={treeData}
              onCheck={(keys, { node: { key } }) => {
                if (!checkStrictly) {
                  const selected = !isChecked(checkedKeys, key);
                  let diffKeys = difference(keys, targetKeys);
                  diffKeys = selected
                    ? difference(diffKeys, selectedKeys)
                    : difference(selectedKeys, diffKeys);
                  onItemSelectAll(diffKeys, selected);
                  return;
                }
                onItemSelect(key, !isChecked(checkedKeys, key));
              }}
              showLine={{
                showLeafIcon: false,
              }}
              selectable={false}
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              className={styles.tree}
              disabled={disabled}
              {...treeProps}
            />
          </div>
        );
      }

      if (type === TRANSFER_TYPE.TABLE.code) {
        const rowSelection = {
          getCheckboxProps: (item) => ({
            disabled: disabled || item.disabled,
          }),
          onSelectAll(selected, selectedRows) {
            const treeSelectedKeys = selectedRows
              .filter((item) => !item.disabled)
              .map(({ key }) => key);
            const diffKeys = selected
              ? difference(treeSelectedKeys, selectedKeys)
              : difference(selectedKeys, treeSelectedKeys);
            onItemSelectAll(diffKeys, selected);
          },
          onSelect({ key }, selected) {
            onItemSelect(key, selected);
          },
          selectedRowKeys: selectedKeys,
        };
        return (
          <div
            className="ant-transfer-list-content"
            style={{ height: isShowSearch(direction, showSearch) ? 'calc(100% - 56px)' : '100%' }}
          >
            <Table
              rowSelection={rowSelection}
              dataSource={currentPageData}
              size="small"
              style={{
                pointerEvents: disabled ? 'none' : undefined,
              }}
              onRow={({ key, disabled: itemDisabled }) => ({
                onClick: () => {
                  if (itemDisabled || disabled) return;
                  onItemSelect(key, !selectedKeys.includes(key));
                },
              })}
              {...tableProps}
              pagination={false}
            />
          </div>
        );
      }

      if (
        type === TRANSFER_TYPE.CUSTOM.code &&
        renderLeftColumn &&
        typeof renderLeftColumn === 'function'
      ) {
        return (
          <div
            className="ant-transfer-list-content"
            style={{ height: isShowSearch(direction, showSearch) ? 'calc(100% - 56px)' : '100%' }}
          >
            {isEmptyArray(currentPageData) ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="ant-transfer-list-body-not-found"
              />
            ) : (
              renderLeftColumn(itemProps, currentPageData, filterData)
            )}
          </div>
        );
      }
      return (
        <ul
          className={`ant-transfer-list-content ${
            isEmptyArray(currentPageData) && 'ant-transfer-list-content-empty'
          } `}
          style={{ height: isShowSearch(direction, showSearch) ? 'calc(100% - 56px)' : '100%' }}
        >
          {isEmptyArray(currentPageData) ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="ant-transfer-list-body-not-found"
            />
          ) : (
            <>
              {currentPageData.map((item) => (
                <li
                  className={`ant-transfer-list-content-item ${
                    (disabled || item.disabled) && 'ant-transfer-list-content-item-disabled'
                  }`}
                  key={item.key}
                  onClick={() => {
                    if (disabled || item.disabled) {
                      return;
                    }
                    onItemSelect(item.key, !isChecked(selectedKeys, item.key));
                  }}
                >
                  <Checkbox
                    onChange={() => onItemSelect(item.key, !isChecked(selectedKeys, item.key))}
                    checked={isChecked(selectedKeys, item.key)}
                    className="ant-transfer-list-checkbox"
                    disabled={disabled || item.disabled}
                  />
                  <span className="ant-transfer-list-content-item-text">{render(item)}</span>
                </li>
              ))}
            </>
          )}
        </ul>
      );
    };

    const renderRightItem = (itemProps, currentPageData, filterData) => {
      const { onItemSelect, selectedKeys, disabled, direction, onItemSelectAll } = itemProps;
      if (type === TRANSFER_TYPE.TABLE.code) {
        const rowSelection = {
          getCheckboxProps: (item) => ({
            disabled: disabled || item.disabled,
          }),
          onSelectAll(selected, selectedRows) {
            const treeSelectedKeys = selectedRows
              .filter((item) => !item.disabled)
              .map(({ key }) => key);
            const diffKeys = selected
              ? difference(treeSelectedKeys, selectedKeys)
              : difference(selectedKeys, treeSelectedKeys);
            onItemSelectAll(diffKeys, selected);
          },
          onSelect({ key }, selected) {
            onItemSelect(key, selected);
          },
          selectedRowKeys: selectedKeys,
        };
        return (
          <div
            className="ant-transfer-list-content"
            style={{ height: isShowSearch(direction, showSearch) ? 'calc(100% - 56px)' : '100%' }}
          >
            <Table
              rowSelection={rowSelection}
              dataSource={currentPageData}
              size="small"
              style={{
                pointerEvents: disabled ? 'none' : undefined,
              }}
              onRow={({ key, disabled: itemDisabled }) => ({
                onClick: () => {
                  if (itemDisabled || disabled) return;
                  onItemSelect(key, !selectedKeys.includes(key));
                },
              })}
              {...tableProps}
              pagination={false}
            />
          </div>
        );
      }

      if (
        type === TRANSFER_TYPE.CUSTOM.code &&
        renderRightColumn &&
        typeof renderRightColumn === 'function'
      ) {
        return (
          <div
            className="ant-transfer-list-content"
            style={{ height: isShowSearch(direction, showSearch) ? 'calc(100% - 56px)' : '100%' }}
          >
            {isEmptyArray(currentPageData) ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="ant-transfer-list-body-not-found"
              />
            ) : (
              renderRightColumn(itemProps, currentPageData, filterData)
            )}
          </div>
        );
      }
      return (
        <ul
          className={`ant-transfer-list-content ${
            isEmptyArray(currentPageData) && 'ant-transfer-list-content-empty'
          }
        ${oneWay && 'ant-transfer-list-content-show-remove'} `}
          style={{
            height: isShowSearch(direction, showSearch) ? 'calc(100% - 56px)' : '100%',
          }}
        >
          {isEmptyArray(currentPageData) ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="ant-transfer-list-body-not-found"
            />
          ) : (
            <>
              {currentPageData.map((item) => (
                <li
                  className={`ant-transfer-list-content-item ${
                    (disabled || item.disabled) && 'ant-transfer-list-content-item-disabled'
                  }`}
                  key={item.key}
                  onClick={() => {
                    if (disabled || item.disabled || oneWay) {
                      return;
                    }
                    onItemSelect(item.key, !isChecked(selectedKeys, item.key));
                  }}
                >
                  {!oneWay && (
                    <Checkbox
                      onChange={() => onItemSelect(item.key, !isChecked(selectedKeys, item.key))}
                      checked={isChecked(selectedKeys, item.key)}
                      className="ant-transfer-list-checkbox"
                      disabled={disabled || item.disabled}
                    />
                  )}

                  <span className="ant-transfer-list-content-item-text">{render(item)}</span>
                  {oneWay && (
                    <div
                      className="ant-transfer-list-content-item-remove"
                      onClick={() => {
                        const keys = targetKeys.filter((v) => v !== item.key);
                        setTargetKeys(keys);
                        onChange(keys);
                      }}
                    >
                      <DeleteOutlined />
                    </div>
                  )}
                </li>
              ))}
            </>
          )}
        </ul>
      );
    };

    const transferData = useMemo(() => {
      function getNodeData(data, arr = []) {
        if (isEmptyArray(data)) {
          return [];
        }
        data.forEach((item) => {
          if (item?.checkable) {
            arr.push(item);
          }
          getNodeData(item?.children, arr);
        });
        return arr;
      }
      if (type === TRANSFER_TYPE.TREE.code) {
        return getNodeData(data);
      }
      return data;
    }, [data, type]);

    // 获得分页、筛选数据
    const getFilterData = ({ direction, filteredItems }) => {
      const filterData = onSearch(direction, searchValue[direction], filteredItems);
      let currentPage = paginationParams[direction]?.current || 1;
      let currentPageData = pagination
        ? getPaginationData(filterData, currentPage, pageSize)
        : filterData;
      if (pagination && isEmptyArray(currentPageData) && currentPage > 1) {
        currentPage = 1;
        currentPageData = pagination
          ? getPaginationData(filterData, currentPage, pageSize)
          : filterData;
      }
      paginationParamsRef.current = {
        ...paginationParamsRef.current,
        [direction]: {
          current: currentPage,
        },
      };
      return {
        currentPageData,
        currentPage,
        filterData,
      };
    };

    if (readonly) {
      return <div>{renderText(transferData, targetKeys)}</div>;
    }

    return (
      <Transfer
        dataSource={transferData}
        className={`${styles.transfer} ${restProps?.listStyle?.width && styles.ignore}`}
        targetKeys={targetKeys}
        selectedKeys={selectKeys}
        onChange={handleChange}
        onSelectChange={handleSelectChange}
        render={render}
        oneWay={oneWay && type !== TRANSFER_TYPE.TABLE.code}
        {...restProps}
      >
        {(itemProps) => {
          if (isEmptyArray(data)) {
            return null;
          }
          const { direction, filteredItems, disabled } = itemProps;
          if (direction === 'left') {
            const { currentPage, currentPageData, filterData } = getFilterData(itemProps);
            return (
              <>
                {isShowSearch(direction, showSearch) && (
                  <div className="ant-transfer-list-body-search-wrapper">
                    <Input
                      placeholder="请输入搜索内容"
                      prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
                      onChange={handleLeftSearch}
                      allowClear
                      disabled={disabled}
                      {...searchProps}
                    />
                  </div>
                )}
                {renderLeftItem(itemProps, currentPageData, filterData)}
                {pagination && type !== TRANSFER_TYPE.TREE.code && !isEmptyArray(filterData) && (
                  <Pagination
                    simple
                    current={currentPage}
                    total={filterData.length}
                    className="ant-transfer-list-pagination"
                    onChange={(page) =>
                      setPaginationParams((v) => ({ ...v, [direction]: { current: page } }))
                    }
                  />
                )}
              </>
            );
          }
          if (direction === 'right') {
            if (isEmptyArray(filteredItems)) {
              return null;
            }
            const { currentPage, currentPageData, filterData } = getFilterData(itemProps);
            return (
              <>
                {isShowSearch(direction, showSearch) && (
                  <div className="ant-transfer-list-body-search-wrapper">
                    <Input
                      placeholder="请输入搜索内容"
                      prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
                      onChange={(e) => {
                        setSearchValue((v) => ({ ...v, [direction]: e.target.value }));
                        if (pagination) {
                          setPaginationParams((v) => ({
                            ...v,
                            [direction]: {
                              current: 1,
                            },
                          }));
                        }
                      }}
                      allowClear
                      disabled={disabled}
                      {...searchProps}
                    />
                  </div>
                )}
                {renderRightItem(itemProps, currentPageData, filterData)}
                {pagination && !isEmptyArray(filterData) && (
                  <Pagination
                    simple
                    current={currentPage}
                    total={filterData.length}
                    className="ant-transfer-list-pagination"
                    onChange={(page) =>
                      setPaginationParams((v) => ({ ...v, [direction]: { current: page } }))
                    }
                  />
                )}
              </>
            );
          }
        }}
      </Transfer>
    );
  },
);

export default BaseTransfer;
