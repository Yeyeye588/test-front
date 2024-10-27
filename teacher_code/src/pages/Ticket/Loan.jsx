import { getNormalRules } from '@/common/project';
import FileUpload from '@/components/FileUpload';
import { UPLOAD_TYPE } from '@/components/FileUpload/fileUtils';
import FormItemGroup from '@/components/FormItemGroup';
import { fetchTicketDetails, fetchTicketPay } from '@/services/api';
import { parseFileToBase64 } from '@/utils/format';
import { usePageProps } from '@/utils/hooks';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Button, Card, Form, Space, message } from 'antd';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FinanceDescriptions, TicketDescriptions2 } from '../Common/Detail';

const FORM_LAYOUT = {
  sm: 12,
  md: 12,
  xl: 12,
};

const optType = {
  AGREE: 1,
  REJECT: 0,
};

const Normal = React.memo(({}) => {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const { queryParams = {} } = usePageProps();
  const handleSubmit = (opt) => {
    setSubmitLoading(true);
    if (opt === optType.AGREE) {
      form.validateFields().then((values) => {
        const payload = {
          ...values,
          id: queryParams?.id,
          agree: opt,
          payFile: values?.fileList?.[0]?.dataUrl,
          payFileName: values?.fileList?.[0]?.fileName,
        };
        fetchTicketPay(payload).then(() => {
          message.success('放款成功');
          history.back();
        }).finally(() => {
          setSubmitLoading(false);
        });
      });
      return;
    }
    fetchTicketPay({
      id: queryParams?.id,
      agree: opt,
    }).then(() => {
      message.success('放款已驳回!');
      history.back();
    }).finally(() => {
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
      <Space direction="vertical" size="middle" style={{ display: 'flex', marginTop: 20 }}>
        <Card title="金票信息">
          <TicketDescriptions2 detail={fromDetail} />
        </Card>
        <Card title="融资信息">
          <FinanceDescriptions detail={fromDetail} />
        </Card>
        <Card title="融资信息">
          <Form form={form}>
            <FormItemGroup gutter={[20, 5]}>
              <Form.Item
                name="fileList"
                label="放款凭证"
                colProps={FORM_LAYOUT}
                rules={getNormalRules('放款凭证', {
                  maxLen: 50,
                  select: true,
                })}
                validateFirst
              >
                <FileUpload
                  text="放款凭证"
                  accept={['jpg', 'png']}
                  fileLen={1}
                  uploadType={UPLOAD_TYPE.PICTURE.code}
                  tooltipTitle=""
                  customRequest={async (options) => {
                    const { onSuccess, file } = options;
                    const dataUrl = await parseFileToBase64(file);
                    onSuccess({
                      code: 0,
                      data: {
                        fileKey: uuidv4(),
                        fileName: file.name,
                        url: dataUrl,
                        dataUrl: dataUrl,
                      },
                    });
                  }}
                />
              </Form.Item>
            </FormItemGroup>
          </Form>
        </Card>
        <div style={{ textAlign: 'center' }}>
          <Space>
            <Button
              onClick={() => {
                history.go(-1);
              }}
            >
              返回
            </Button>
            <Button onClick={() => handleSubmit(optType.REJECT)} loading={submitLoading}>驳回</Button>
            <Button type="primary" onClick={() => handleSubmit(optType.AGREE)} loading={submitLoading}>
              确认放款
            </Button>
          </Space>
        </div>
      </Space>
    </PageContainer>
  );
});

export default Normal;
