import { getNormalRules } from '@/common/project';
import FormItemGroup from '@/components/FormItemGroup';
import { fetchTicketDetails, fetchTicketTransfer } from '@/services/api';
import { usePageProps } from '@/utils/hooks';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { useRequest } from 'ahooks';
import {
  Button,
  Card,
  Form,
  InputNumber,
  Result,
  Select,
  Space,
  Steps,
  message
} from 'antd';
import React, { useState } from 'react';
import { TicketDescriptions2, TransferDescriptions } from '../Common/Detail';
import { userList } from '../User/Login';

const FORM_LAYOUT = {
  sm: 12,
  md: 12,
  xl: 12,
};

const contentStyle = {
  // lineHeight: '260px',
  marginTop: 16,
};

const Normal = React.memo(({}) => {
  const [form] = Form.useForm();

  const { queryParams = {} } = usePageProps();

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
          recPrice: res?.price * 0.5,
        });
      },
      onError: (res) => {
        message.error(res?.message || '请求失败');
      },
    },
  );

  const [detail, setDetail] = useState({});

  const [current, setCurrent] = useState(0);
  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };

  const steps = [
    {
      title: '填写信息',
      content: (
        <>
          <Card title="金票信息">
            <TicketDescriptions2 detail={fromDetail} />
          </Card>
          <Card title="收票企业">
            <Form form={form}>
              <FormItemGroup gutter={[20, 5]}>
                <Form.Item
                  name="recEntName"
                  label="收票企业"
                  colProps={FORM_LAYOUT}
                  rules={getNormalRules('收票企业', {
                    maxLen: 30,
                  })}
                  validateFirst
                >
                  <Select
                    options={userList.filter((item) => item.role === '一级供应商')}
                    fieldNames={{
                      label: 'name',
                      value: 'name',
                    }}
                    placeholder="请选择"
                  />
                </Form.Item>
                <Form.Item
                  name="recPrice"
                  label="转让金额"
                  colProps={FORM_LAYOUT}
                  rules={getNormalRules('转让金额', {
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
          <Card title="收票企业">
            <TransferDescriptions detail={detail} />
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
            title={<div>转让申请成功</div>}
            extra={[
              <Button
                type="primary"
                key="console"
                onClick={() => {
                  history.push('/ticket/list');
                }}
              >
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
    setSubmitLoading(true);
    fetchTicketTransfer({
      ...detail,
      id: queryParams?.id,
    }).then(() => {
      message.success(`转让成功`);
      history.back();
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
            确认转让
          </Button>
        )}
      </div>
    </PageContainer>
  );
});

export default Normal;
