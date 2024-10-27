import { getNormalRules } from '@/common/project';
import FormItemGroup from '@/components/FormItemGroup';
import { fetchTicketDetails, fetchTicketFinancing } from '@/services/api';
import { usePageProps } from '@/utils/hooks';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { useRequest } from 'ahooks';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Result,
  Select,
  Space,
  Steps,
  message
} from 'antd';
import React, { useState } from 'react';
import {
  FinanceDescriptions,
  TicketDescriptions2
} from '../Common/Detail';
import { userList } from '../User/Login';

const FORM_LAYOUT = {
  sm: 12,
  md: 12,
  xl: 12,
};


const Normal = React.memo(({}) => {
  const [form] = Form.useForm();

  const { queryParams = {} } = usePageProps();
  const [detail, setDetail] = useState({});

  const [current, setCurrent] = useState(0);
  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };

  const { data: fromDetail, loading: detailLoading } = useRequest(
    async (v) => {
      if (!queryParams.id) {
        return;
      }
      const result = await fetchTicketDetails({
        id: queryParams?.id,
        ...v,
      });
      const payload = result.data || {};
      return {
        ...payload,
      };
    },
    {
      onSuccess: (res) => {
        form.setFieldsValue({
          financingPrice: res?.price,
        });
      },
      onError: (res) => {
        message.error(res?.message || '请求失败');
      },
    },
  );

  const steps = [
    {
      title: '填写信息',
      content: (
        <>
          <Card title="金票信息">
            <TicketDescriptions2 detail={fromDetail} />
          </Card>
          <Card title="申请融资信息">
            <Form form={form}>
              <FormItemGroup gutter={[20, 5]}>
                <Form.Item
                  name="financingPrice"
                  label="申请金额"
                  colProps={FORM_LAYOUT}
                  rules={getNormalRules('申请金额', {
                    maxLen: 50,
                    validateLen: false,
                  })}
                  validateFirst
                >
                  <InputNumber
                    min={1}
                    precision={0}
                    placeholder="请输入"
                    style={{ width: '100%' }}
                    disabled
                  />
                </Form.Item>
                <Form.Item
                  name="businessName"
                  label="保理商"
                  colProps={FORM_LAYOUT}
                  rules={getNormalRules('保理商', {
                    maxLen: 30,
                    select: true,
                  })}
                  validateFirst
                >
                  <Select
                    options={userList.filter((item) => item.role === '保理商')}
                    fieldNames={{
                      label: 'name',
                      value: 'name',
                    }}
                    placeholder="请选择"
                  />
                </Form.Item>
                <Form.Item
                  name="bankAccount"
                  label="收款账号"
                  colProps={FORM_LAYOUT}
                  rules={getNormalRules('收款账号', {
                    maxLen: 30,
                  })}
                  validateFirst
                >
                  <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item
                  name="bankName"
                  label="开户行"
                  colProps={FORM_LAYOUT}
                  rules={getNormalRules('开户行', {
                    maxLen: 30,
                  })}
                  validateFirst
                >
                  <Input placeholder="请输入" />
                </Form.Item>
              </FormItemGroup>
            </Form>
          </Card>
        </>
      ),
    },
    {
      title: '核对信息',
      content: (
        <>
          <Card title="金票信息">
            <TicketDescriptions2 detail={fromDetail} />
          </Card>
          <Card title="申请融资信息">
            <FinanceDescriptions detail={detail} />
          </Card>
        </>
      ),
    },
    {
      title: '申请成功',
      content: (
        <Card>
          <Result
            status="success"
            title={<div>申请融资成功</div>}
            extra={[
              <Button type="primary" key="console" onClick={() => {
                history.go(-1);
              }}>
                确定
              </Button>,
            ]}
          />
        </Card>
      ),
    },
  ];

  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
      };
      setDetail(payload);
      next();
    });
  };


  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmitAdd = () => {
    setSubmitLoading(true)
    fetchTicketFinancing({
      ...detail,
      id: queryParams?.id,
    }).then(() => {
      message.success(`融资申请成功`);
      next();
    }).finally(() => {
      setSubmitLoading(false)
    });
  };

  return (
    <PageContainer footerToolBarProps={{ portalDom: false }} loading={detailLoading}>
      <Steps current={current} items={items} />
      <Space direction="vertical" size="middle" style={{ display: 'flex', marginTop: 20 }}>
        {steps[current].content}
      </Space>
      <div
        style={{
          marginTop: 24,
          textAlign: 'center'
        }}
      >
        {current > 0 && current < steps.length - 1 && (
          <Button
            style={{
              margin: '0 8px',
            }}
            onClick={() => prev()}
          >
            上一步
          </Button>
        )}
        {current === 0 && (
          <Button
            type="primary"
            onClick={() => {
              handleSubmit();
            }}
          >
            下一步
          </Button>
        )}
        {current === 1 && (
          <Button type="primary" onClick={() => handleSubmitAdd()} loading={submitLoading}>
            确认申请
          </Button>
        )}
      </div>
    </PageContainer>
  );
});

export default Normal;
