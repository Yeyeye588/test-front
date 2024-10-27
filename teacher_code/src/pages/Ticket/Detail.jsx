import { fetchTicketAudit, fetchTicketDetails } from '@/services/api';
import { usePageProps } from '@/utils/hooks';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Card, Space, message } from 'antd';
import React from 'react';
import { TicketDescriptions2 } from '../Common/Detail';

const Normal = React.memo(({}) => {
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
        <Card title="金票信息">
          <TicketDescriptions2 detail={fromDetail} />
        </Card>
      </Space>
    </PageContainer>
  );
});

export default Normal;
