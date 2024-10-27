import React, { useState } from 'react';
import { Button, Card, Space, Steps, message } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { useRequest } from 'ahooks';
import { usePageProps } from '@/utils/hooks';
import { TYPE_ENUM } from '@/common/enum';
import { fetchTicketAudit, fetchTicketDetails } from '@/services/api';
import { TicketDescriptions2 } from '../Common/Detail';

const Normal = React.memo(({}) => {
  const { queryParams = {} } = usePageProps();

  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = (type) => {
    setSubmitLoading(true);
    fetchTicketAudit({
      id: queryParams?.id,
      type: type.code,
    })
      .then(() => {
        message.success(`${type?.desc}`);
        history.back();
      })
      .finally(() => {
        setSubmitLoading(false);
      });
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
      onSuccess: () => {
        if (!queryParams.id) {
          return;
        }
      },
      onError: (res) => {
        message.error(res?.message || '请求失败');
      },
    },
  );

  return (
    <PageContainer footerToolBarProps={{ portalDom: false }} loading={detailLoading}>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card title="开票进度">
          <Steps
            direction="vertical"
            current={0}
            items={[
              {
                title: '开票待签收',
              },
              {
                title: '复审通过',
              },
              {
                title: '初审通过',
              },
              {
                title: '确权通过',
              },
              {
                title: '申请成功',
              },
            ]}
          />
        </Card>
        <Card title="金票信息">
          <TicketDescriptions2 detail={fromDetail} />
        </Card>
        <div style={{ textAlign: 'center' }}>
          <Space>
            <Button onClick={() => history.go(-1)}>返回</Button>
            <Button
              onClick={() => handleSubmit(TYPE_ENUM.SIGN_OFF_REJECTION)}
              loading={submitLoading}
            >
              驳回
            </Button>
            <Button
              type="primary"
              onClick={() => handleSubmit(TYPE_ENUM.SIGN_OFF_APPROVAL)}
              loading={submitLoading}
            >
              签收
            </Button>
          </Space>
        </div>
      </Space>
    </PageContainer>
  );
});

export default Normal;
