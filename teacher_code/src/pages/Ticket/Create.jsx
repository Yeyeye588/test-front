import { getNormalRules } from '@/common/project';
import BaseDatePicker from '@/components/BaseDatePicker';
import FileUpload from '@/components/FileUpload';
import FormItemGroup from '@/components/FormItemGroup';
import { fetchTicketDetails, fetchTicketSave } from '@/services/api';
import { formatFiles, formatTimeUnix } from '@/utils/format';
import { usePageProps } from '@/utils/hooks';
import { PageContainer } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Button, Card, Form, Input, InputNumber, Result, Steps, message } from 'antd';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TicketDescriptions } from '../Common/Detail';

const FORM_LAYOUT = {
  sm: 24,
  md: 24,
  xl: 24,
};

/**
 * 文件转成base64
 * @param {*} file
 * @returns
 */
function parseFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const contentStyle = {
  lineHeight: '260px',
  textAlign: 'center',
  marginTop: 16,
};

const Normal = React.memo(({}) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState;

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

  const steps = [
    {
      title: '填写信息',
      content: (
        <>
          <Card>
            <Form
              form={form}
              labelCol={{
                span: 4,
              }}
              wrapperCol={{
                span: 8,
              }}
              initialValues={{
                invoiceEntName: currentUser?.name,
              }}
            >
              <FormItemGroup gutter={[20, 5]}>
                <Form.Item
                  name="invoiceEntName"
                  label="开票企业"
                  colProps={FORM_LAYOUT}
                  rules={getNormalRules('开票企业', {
                    maxLen: 30,
                  })}
                  validateFirst
                >
                  <Input placeholder="请输入" disabled/>
                </Form.Item>
                <Form.Item
                  name="price"
                  label="金票金额"
                  colProps={FORM_LAYOUT}
                  rules={getNormalRules('金票金额', {
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
                  />
                </Form.Item>
                <Form.Item
                  name="ddlTime"
                  label="到期日"
                  colProps={FORM_LAYOUT}
                  rules={getNormalRules('到期日', {
                    select: true,
                  })}
                  validateFirst
                >
                  <BaseDatePicker type="DATE" disabledBefore />
                </Form.Item>
                <Form.Item
                  name="fileList"
                  label="上传合同材料"
                  colProps={FORM_LAYOUT}
                  validateFirst
                >
                  <FileUpload
                    text="上传文件"
                    accept={['pdf']}
                    fileLen={1}
                    type="Button"
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
        </>
      ),
    },
    {
      title: '核对信息',
      content: (
        <Card>
          <TicketDescriptions detail={detail} />
        </Card>
      ),
    },
    {
      title: '申请成功',
      content: (
        <Card>
          <Result
            status="success"
            title={
              <div>
                申请成功
                <br />
                请耐心等待核心企业审核!
              </div>
            }
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
        file: values.fileList?.map((item) => item.dataUrl)?.[0],
        fileName: values?.fileList?.map((item) => item.name)?.[0],
      };
      setDetail(payload);
      next();
    });
  };

  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmitAdd = (type) => {
    setSubmitLoading(true)
    if (queryParams?.id) {
      fetchTicketSave({
        ...fromDetail,
        ...detail,
        id: queryParams?.id,
      }).then(() => {
        message.success(`重新申请成功`);
        history.back();
      }).finally(() => {
        setSubmitLoading(false)
      });
      return;
    }
    fetchTicketSave(detail).then(() => {
      message.success(`提交成功`);
      next();
    }).finally(() => {
      setSubmitLoading(false)
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
      return result.data || {};
    },
    {
      onSuccess: (res) => {
        if (!queryParams.id) {
          return;
        }

        const arr = res?.file
          ? [
              {
                fileKey: res?.fileName,
                fileName: res?.fileName,
                url: res?.file,
                status: 'done',
              },
            ]
          : [];

        form.setFieldsValue({
          ...res,
          ddlTime: formatTimeUnix(res?.ddlTime, ''),
          fileList: formatFiles(arr),
        });
      },
      onError: (res) => {
        message.error(res?.message || '请求失败');
      },
    },
  );

  return (
    <PageContainer footerToolBarProps={{ portalDom: false }} loading={detailLoading}>
      <Steps current={current} items={items} />
      <div style={contentStyle}>{steps[current].content}</div>
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
