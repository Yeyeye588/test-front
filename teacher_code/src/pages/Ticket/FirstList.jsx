import { LIST_FORM_LAYOUT } from '@/common/enum';
import { fetchTicketPage } from '@/services/api';
import { useSearchFormTable } from '@/utils/hooks';
import { UrlQueryParamTypes, formatQuery, replaceRoute } from '@/utils/query';
import { getPageQuery } from '@/utils/utils';
import { PageContainer } from '@ant-design/pro-components';
import { Link, useModel, useRequest } from '@umijs/max';
import { Button, Card, Col, Form, Input, Row, Space, Table, message } from 'antd';

const urlPropsQueryConfig = {
  ticketNo: { type: UrlQueryParamTypes.string },
  status: { type: UrlQueryParamTypes.string },
  pageNum: { type: UrlQueryParamTypes.number },
  pageSize: { type: UrlQueryParamTypes.number },
};

const List = ({
  saveRoutingCache = true, // 查询项是否保留路由，若开启，表单筛查项会显示在页面路由
}) => {
  const { run: fetchTableList, data: listData } = useRequest((v) => fetchTicketPage(v), {
    manual: true,
    onError: (res) => {
      message.error(res?.message || '请求失败');
    },
    // 数据处理
    formatResult: ({ data: res }) => {
      const arr = res?.items.map((item, index) => ({
        ...item,
        orderNum: index + 1,
        rowKey: `rowKey-${item?.id}-${index + 1}`,
      }));
      return {
        ...res,
        items: arr,
      };
    },
  });
  const queryParams = formatQuery(getPageQuery(window.location.href), urlPropsQueryConfig);
  const [form] = Form.useForm();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState;

  const getTableData = ({ current = 1, pageSize = 10 }, formData) => {
    const payload = {
      pageNum: current,
      pageSize,
      ...formData,
      audit: 1,
      roleType: currentUser?.roleType,
    };
    if (saveRoutingCache) {
      replaceRoute(payload);
    }
    return fetchTableList(payload);
  };

  const {
    tableProps,
    refresh,
    search: { reset, submit },
  } = useSearchFormTable(getTableData, {
    form,
    total: listData?.total,
    dataSource: listData?.items,
    defaultParams: saveRoutingCache
      ? [
          {
            current: queryParams?.pageNum || 1,
            pageSize: queryParams?.pageSize || 10,
          },
          queryParams,
        ]
      : [
          {
            current: 1,
            pageSize: 10,
          },
        ],
  });

  const getStatusLinks = (record) => {
    // Default case when Space is empty
    return '-';
  };

  const columns = [
    {
      title: '金票编号',
      dataIndex: 'ticketNo',
      render: (text, record) => <Link to={`/ticket/list/confirm?id=${record?.id}`}>{text}</Link>,
    },
    {
      title: '金额',
      dataIndex: 'price',
    },
    {
      title: '开票企业',
      dataIndex: 'invoiceEntName',
    },
    {
      title: '申请日',
      dataIndex: 'createTime',
    },
    {
      title: '到期日',
      dataIndex: 'ddlTime',
    },
    {
      title: '状态',
      dataIndex: 'status',
    },
    {
      title: '操作',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status === '开票待初审' && (
            <Link to={`/ticket/list/first?id=${record?.id}`}>初审</Link>
          )}
        </Space>
      ),
    },
  ];

  const renderSearchForm = () => (
    <Form form={form} name="search">
      <Row gutter={24}>
        <Col {...LIST_FORM_LAYOUT} xl={8}>
          <Form.Item label="金票编号" name="ticketNo">
            <Input maxLength={50} placeholder="请输入" />
          </Form.Item>
        </Col>
        <Col {...LIST_FORM_LAYOUT} xl={8} md={24} style={{ textAlign: 'right' }}>
          <Space style={{ marginBottom: 24 }}>
            <Button style={{ marginLeft: 8 }} onClick={reset}>
              重置
            </Button>
            <Button type="primary" htmlType="submit" onClick={submit}>
              搜索
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );

  return (
    <PageContainer breadcrumb={null} title="初审">
      <Card bordered={false} className="search">
        {renderSearchForm()}
      </Card>
      <Card bordered={false} style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          rowKey={(record) => record.id}
          {...tableProps}
          className="myTable"
        />
      </Card>
    </PageContainer>
  );
};
export default List;
