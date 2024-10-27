import { useCallback, useState, useRef, useEffect } from 'react';
import {
  useLocation,
  useAccess,
  useParams,
  useRouteData,
  history,
  useModel,
  useNavigate,
} from '@umijs/max';
import { useAntdTable, useMount } from 'ahooks';
import { useDispatch, useSelector } from 'dva';
import { formatArray } from './format';
import { getPageQuery } from './utils';

/**
 * 自定义dva hook
 * @param {Object} loadingPaths {loading: path}
 * @param { Array } user ["model"]
 */
export function useDva(loadingPaths = {}, users = []) {
  const dispatch = useDispatch();
  const loadingEffect = useSelector((state) => state.loading);
  const loadings = {};
  const data = useSelector((state) => {
    const obj = {};
    users.forEach((m) => {
      obj[m] = state[m];
    });
    return obj;
  });
  if (loadingPaths instanceof Object) {
    Object.keys(loadingPaths).forEach((key) => {
      loadings[key] = loadingEffect.effects[loadingPaths[key]] || false;
    });
  }
  return {
    dispatch,
    loadings,
    data,
  };
}

/**
 * 自定义modal hook
 */
export function useModalParams() {
  const [visible, setVisible] = useState(false);
  const paramsRef = useRef({});
  const hideModal = useCallback(() => {
    setVisible(false);
    paramsRef.current = {};
  }, []);
  const showModal = useCallback(({ ...p }) => {
    paramsRef.current = p;
    setVisible(true);
  }, []);
  return {
    hideModal,
    showModal,
    visible,
    params: paramsRef.current,
    modalProps: {
      open: visible,
      onCancel: hideModal,
      maskClosable: false,
      okText: '确认',
      cancelText: '取消',
      destroyOnClose: true,
    },
  };
}

/**
 * 自定义drawer hook
 */
export function useDrawerParams() {
  const [visible, setVisible] = useState(false);
  const paramsRef = useRef({});
  const hideModal = useCallback(() => {
    setVisible(false);
    paramsRef.current = {};
  }, []);
  const showModal = useCallback(({ ...p }) => {
    paramsRef.current = p;
    setVisible(true);
  }, []);
  return {
    hideModal,
    showModal,
    visible,
    params: paramsRef.current,
    modalProps: {
      open: visible,
      onClose: hideModal,
      maskClosable: false,
      destroyOnClose: true,
    },
  };
}

/**
 * @description useAntdTable封装，提供antd table和筛选表单功能
 * @param {*} request 表单请求
 * @param {*} options 其他参数 {form, total, dataSource = [], format = true, defaultPageSize = 10, showTotal = true, size = 'middle', ...}
 * @returns {Object} { tableProps, search: {submit, reset}, loading, refresh, ...}
 */
export function useSearchFormTable(request, options) {
  const {
    form,
    total = 0,
    dataSource = [],
    format = true,
    defaultPageSize = 10,
    showTotal = true,
    size = 'middle',
    tableSelect = false, // 是否开启选择
    rowKey = 'id', // 列表索引，必传
    editable = false, // 是否编辑当前行
    handleEdit = () => {}, // 编辑保存,
    ...rest
  } = options;

  const { tableProps, search, loading, refresh, ...returnOptions } = useAntdTable(request, {
    defaultPageSize,
    form,
    ...rest,
  });

  let { pagination } = tableProps;
  const { current, pageSize } = pagination;

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [unSelectedRowKeys, setUnselectRowKeys] = useState([]);
  const selectAllRef = useRef(false);

  const [editKeys, setEditKeys] = useState([]);

  const getTableRowKey = useCallback(
    (item) => {
      if (typeof rowKey === 'function') {
        return rowKey(item);
      }
      return item?.[rowKey];
    },
    [rowKey],
  );

  useEffect(() => {
    if (selectAllRef.current === true) {
      setSelectedRowKeys(
        dataSource.map((v) => getTableRowKey(v)).filter((key) => !unSelectedRowKeys.includes(key)),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource]);

  pagination = {
    ...pagination,
    current,
    pageSize,
    showQuickJumper: true,
    showSizeChanger: true,
    total,
    showTotal: () =>
      showTotal ? `共${total}条记录 第${current}/${Math.ceil(total / pageSize)}页` : '',
  };
  tableProps.pagination = pagination;
  tableProps.dataSource = format ? formatArray(dataSource) : dataSource;
  tableProps.size = size;
  tableProps.rowKey = rowKey;
  if (tableSelect) {
    const rowSelection = {
      selectedRowKeys,
      onChange: (v) => setSelectedRowKeys(v),
      onSelect: (record, selected) => {
        if (!selected) {
          setUnselectRowKeys([...unSelectedRowKeys, getTableRowKey(record)]);
        }
      },
      onSelectAll: (selected) => {
        if (!selected) {
          setUnselectRowKeys([...new Set([...unSelectedRowKeys, ...selectedRowKeys])]);
        }
      },
      selections: [
        {
          key: 'all',
          text: '全选所有',
          onSelect: (changableRowKeys) => {
            selectAllRef.current = true;
            setSelectedRowKeys(changableRowKeys);
            setUnselectRowKeys([]);
          },
        },
        {
          key: 'current-all',
          text: '全选当页',
          onSelect: (changableRowKeys) => {
            selectAllRef.current = false;
            setSelectedRowKeys(changableRowKeys);
            setUnselectRowKeys([]);
          },
        },
        {
          key: 'clear-all',
          text: '清空所有',
          onSelect: () => {
            selectAllRef.current = false;
            setSelectedRowKeys([]);
            setUnselectRowKeys([]);
          },
        },
      ],
    };
    tableProps.rowSelection = rowSelection;
  }

  if (editable) {
    tableProps.editable = {
      type: 'multiple',
      editableKeys: editKeys,
      onChange: (val) => {
        setEditKeys(val);
      },
      onSave: (key, row) => {
        handleEdit(key, row).then(() => {
          refresh();
        });
      },
      actionRender: (row, config, dom) => [dom.save, dom.cancel],
    };
  }

  return {
    tableProps,
    search,
    loading,
    selectParams: {
      isSelectAll: selectAllRef.current,
      selectedRowKeys,
      unSelectedRowKeys,
      setSelectedRowKeys,
      setUnselectRowKeys,
      clearAll: () => {
        selectAllRef.current = false;
        setSelectedRowKeys([]);
        setUnselectRowKeys([]);
      },
    },
    refresh,
    setEditKeys,
    ...returnOptions,
  };
}

/**
 * 图表重绘
 * @param {*} chart chartRef
 * @param {*} handleOption
 * @param {Number} intervalTime 间隔重绘时间
 * @param {Array} depths 更新依赖
 */
export function useResizeChart(chart, handleOption = () => {}, intervalTime = 15000, depths = []) {
  const timeRef = useRef();
  const handleChange = () => {
    if (chart.current && chart.current.getEchartsInstance) {
      const instance = chart.current.getEchartsInstance();
      instance.clear();
      handleOption();
    }
  };

  const handleInterval = () => {
    if (timeRef.current) {
      clearInterval(timeRef.current);
    }
    if (intervalTime) {
      timeRef.current = setInterval(() => {
        handleChange();
      }, intervalTime);
    }
  };

  const handleResize = () => {
    handleChange();
    handleInterval();
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    window.addEventListener('fullscreenchange', handleResize);
    handleInterval();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('fullscreenchange', handleResize);
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...depths]);
}

/**
 * 处理table横向滚动
 * @param {*} tableId
 * @param {*} depths
 */
export function useScrollTable(tableId, depths = []) {
  const canScroll = (el, scrollDom) => {
    return el.clientWidth + el.scrollLeft < scrollDom.clientWidth;
  };
  const handleShadowDom = (el, add = true) => {
    const doms = el.getElementsByClassName('ant-table-cell-fix-right-first');
    doms.forEach((d) => {
      const node = d.getElementsByClassName('boxShadow');
      const hasShadowNode = node && node?.length;
      if (add) {
        const shadowValue = getComputedStyle(d, ':after')?.getPropertyValue('box-shadow');
        if (hasShadowNode || (shadowValue && shadowValue !== 'none')) {
          return;
        }
        const obj = document.createElement('div');
        obj.className = 'boxShadow';
        obj.style.boxShadow = 'inset -10px 0 8px -8px rgb(0 0 0 / 15%)';
        d.appendChild(obj);
      } else if (hasShadowNode) {
        node.forEach((n) => {
          d.removeChild(n);
        });
      }
    });
  };
  const handleTableScroll = (el) => {
    const [table] = el.getElementsByTagName('table');
    let interValTime = 0;
    if (el.scrollLeft > 0) {
      handleShadowDom(table, false);
      return;
    }
    if (canScroll(el, table)) {
      handleShadowDom(table);
    } else {
      handleShadowDom(table, false);
    }
    const time = setInterval(() => {
      interValTime += 1;
      if (canScroll(el, table) && el.scrollLeft === 0) {
        handleShadowDom(table);
        clearInterval(time);
      }
      if (interValTime === 10) {
        handleShadowDom(table, false);
        clearInterval(time);
      }
    }, 1000);
  };
  useEffect(() => {
    const fatherDom = document.getElementById(tableId);
    if (!fatherDom) {
      return null;
    }
    const [scrollDom] = fatherDom.getElementsByClassName('ant-table-content');
    scrollDom.scrollTo(0, 0);
    handleTableScroll(scrollDom);
    scrollDom.addEventListener('scroll', (e) => handleTableScroll(e.target));
    return () => {
      scrollDom.removeEventListener('scroll', (e) => handleTableScroll(e.target));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...depths]);
}

/**
 * tab轮播切换
 * @params {*} state 所有状态
 * @param {*} checkDeps 变动依赖项
 * @param {*} handleCheck 切换处理函数
 * @param {*} intervalTime 轮播时间
 */
export function useCheckTab(checkDeps, handleCheck = () => {}, intervalTime = 15000) {
  const time = useRef();

  const handleTimeCount = () => {
    return setInterval(() => {
      handleCheck();
    }, intervalTime);
  };

  useEffect(() => {
    if (time.current) {
      clearInterval(time.current);
    }
    if (intervalTime) {
      time.current = handleTimeCount();
    }
    return () => {
      clearInterval(time.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...checkDeps]);
}

/**
 *  编辑列表属性hook(提供属性公共方法)
 * @param {*} value 列表数据
 * @param {*} readonly 是否只读,默认为false
 * @param {*} rowKey 列表主键，默认为id
 * @returns
 */
export function useEditableProTableParams(value, readonly = false, rowKey = 'id') {
  const [editKeys, setEditKeys] = useState(
    value instanceof Array && !readonly ? value.map((v) => v[rowKey]) : [],
  );
  return {
    props: {
      rowKey,
      toolBarRender: false,
      recordCreatorProps: {
        newRecordType: 'dataSource',
        position: 'bottom',
        record: () => ({
          [rowKey]: Date.now(),
        }),
      },
      editable: {
        type: 'multiple',
        editableKeys: editKeys,
        onChange: (val) => {
          setEditKeys(val);
        },
        actionRender: (row, _, dom) => {
          return [dom.delete];
        },
      },
    },
    editKeys,
    setEditKeys,
  };
}

/**
 * proTable组件属性封装，提供类似useSearchFormTable功能
 * @param {*} request
 * @param {*} options {params = {}, rowKey='rowKey', dataSource = [], format = true, defaultPageSize = 10, total, defaultParams,...}
 * @returns {Object} {actionRef, formRef, search: {reset, submit}, refresh, tableProps}
 */
export function useProTable(request, options = {}) {
  const actionRef = useRef();
  const formRef = useRef();
  const {
    params = {},
    rowKey = 'rowKey',
    dataSource = [],
    format = true,
    defaultPageSize = 10,
    total = 0,
    showTotal = true,
    defaultParams,
    paginatio: defaultPagination = {},
    editable = false, // 是否编辑当前行
    handleEdit = () => {}, // 编辑保存,
    ...rest
  } = options;

  const [{ current = 1, pageSize = defaultPageSize }, formParams] = defaultParams;
  const [editKeys, setEditKeys] = useState([]);

  const pagination = {
    total,
    showQuickJumper: true,
    showSizeChanger: true,
    showTotal: () => {
      const { pageInfo } = actionRef.current || {};
      return showTotal
        ? `共${total}条记录 第${pageInfo?.current}/${Math.ceil(total / pageInfo?.pageSize)}页`
        : '';
    },
    ...defaultPagination,
  };
  useMount(() => {
    request({ ...params, current, pageSize, ...formParams });
    if (formRef.current && typeof formRef.current?.setFieldsValue === 'function') {
      formRef.current?.setFieldsValue(formParams);
    }
    if (actionRef.current && typeof actionRef.current?.setPageInfo === 'function') {
      actionRef.current?.setPageInfo({
        current,
        pageSize,
      });
    }
  });

  return {
    actionRef,
    formRef,
    refresh: actionRef.current?.reload,
    search: {
      reset: actionRef.current?.reset,
      submit: formRef.current?.submit,
    },
    tableProps: {
      actionRef,
      formRef,
      request,
      rowKey,
      className: 'myTable',
      params,
      manualRequest: true,
      search: {
        labelWidth: 'auto',
        layout: 'vertical',
        span: {
          xs: 24,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 8,
          xxl: 8,
        },
        defaultCollapsed: false,
      },
      pagination,
      dataSource: format ? formatArray(dataSource) : dataSource,
      editable: editable && {
        type: 'multiple',
        editableKeys: editKeys,
        onChange: (val) => {
          setEditKeys(val);
        },
        onSave: (key, row) => {
          handleEdit(key, row).then(() => {
            actionRef.current?.reload();
          });
        },
        actionRender: (row, config, dom) => [dom.save, dom.cancel],
      },
      ...rest,
    },
  };
}

/**
 * 获得页面参数
 * @returns {Object}
 * { location, access: 权限, params: path参数,queryParams: query参数, route: 当前页面路由, history: history跳转方法, navigate: 路由组件跳转 }
 */
export function usePageProps() {
  const location = useLocation();
  const access = useAccess();
  const params = useParams();
  const { route } = useRouteData();
  const navigate = useNavigate();
  const queryParams = getPageQuery();
  return {
    location,
    access,
    params,
    route,
    queryParams,
    history,
    navigate,
  };
}

/**
 * useModel depths 缓存
 * @param {*} model
 * @param {*} depthsArr 需要返回的参数名，多层级用.分割，如['tableList', 'account.currentUser']
 * @param {*} flattern 多层级是否扁平化
 * @returns
 * @example
 * const {tableList, currentUser = {}} = useMemoModel('user',['tableList','account.currentUser'])
 */
export function useMemoModel(model, depthsArr = [], flattern = true) {
  const props = useModel(model, (m) => {
    const tmp = {};
    depthsArr.forEach((v) => {
      const [k0, ...keys] = v?.split('.');
      if (!keys.length) {
        tmp[k0] = m[k0];
      }
      keys.forEach((k) => {
        if (flattern) {
          tmp[k] = m[k0][k];
          return;
        }
        tmp[k0][k] = m[k0][k];
      });
    });
    return tmp;
  });
  return props;
}

/**
 * 记录旧值
 * @param {*} value
 * @returns
 */
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

/**
 * 返回上一页
 */
export function useGoBack() {
  const { location } = usePageProps();
  const [lastPathObj, setLastPathObj] = useState(
    JSON.parse(sessionStorage.getItem(`${PROJECT_KEY}-lastPathMap`)) || {},
  );
  const routeHistory = localStorage.getItem(`${window.projectKey}-route-history`);

  useMount(() => {
    const routePathArr =
      routeHistory && JSON.parse(routeHistory) instanceof Array ? JSON.parse(routeHistory) : [];

    const newLastPathObj = { ...lastPathObj };

    if (!newLastPathObj[location.pathname] && routePathArr?.length !== 0) {
      newLastPathObj[location.pathname] = routePathArr[routePathArr?.length - 1];
    }

    setLastPathObj(newLastPathObj);
    sessionStorage.setItem(`${PROJECT_KEY}-lastPathMap`, JSON.stringify(newLastPathObj));
  });

  return {
    goBack: () => {
      if (lastPathObj[location.pathname]) {
        history.replace(lastPathObj[location.pathname]);

        const newLastPathObj = { ...lastPathObj };
        delete newLastPathObj[location.pathname];
        sessionStorage.setItem(`${PROJECT_KEY}-lastPathMap`, JSON.stringify(newLastPathObj));
      } else {
        history.go(-1);
      }
    },
  };
}
