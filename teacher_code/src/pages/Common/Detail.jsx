import { Descriptions } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { formatFiles, formatTimeToDate } from '@/utils/format';
import { userList } from '../User/Login';
import FileUpload from '@/components/FileUpload';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_TYPE } from '@/components/FileUpload/fileUtils';

function downloadBase64File(base64Data, fileName) {
  const link = document.createElement('a');
  link.href = `${base64Data}`;
  link.download = fileName;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  // 触发链接的点击事件，开始下载文件
  link.click();
}

export const TicketDescriptions = ({ detail = {} }) => {
  // code计算
  const code = userList.find((item) => item.name === detail?.invoiceEntName)?.code;

  return (
    <Descriptions column={2}>
      <Descriptions.Item label="开票企业">{detail?.invoiceEntName}</Descriptions.Item>
      <Descriptions.Item label="开票金额">{detail?.price}</Descriptions.Item>
      <Descriptions.Item label="社会统一信用代码">{code}</Descriptions.Item>
      <Descriptions.Item label="到期日">{formatTimeToDate(detail?.ddlTime)}</Descriptions.Item>
      <Descriptions.Item label="持票企业">无</Descriptions.Item>
      <Descriptions.Item label="第一收票企业">{detail?.invoiceEntName}</Descriptions.Item>
      <Descriptions.Item label="合同材料">
        <div>
          {!detail?.file ? (
            '暂无文件'
          ) : (
            <a
              onClick={() => {
                if (detail?.file) {
                  downloadBase64File(detail.file, detail.fileName);
                  return;
                }
              }}
              style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
              key={detail?.fileName}
            >
              <LinkOutlined style={{ marginRight: 4 }} />
              {detail?.fileName}
            </a>
          )}
        </div>
      </Descriptions.Item>
    </Descriptions>
  );
};

export const TicketDescriptions2 = ({ detail = {} }) => {
  const code = userList.find((item) => item.name === detail?.invoiceEntName)?.code;

  const company2 = detail.status === '转让待签收' ? '无': (detail?.recEntName || '无');
  const stayCompany = detail.status === '转让待签收' ? detail.invoiceEntName : (detail?.recEntName || detail?.invoiceEntName);

  return (
    <Descriptions column={2}>
      <Descriptions.Item label="捐赠流水">{detail?.ticketNo}</Descriptions.Item>
      <Descriptions.Item label="捐赠时间">{detail?.createTime}</Descriptions.Item>
      <Descriptions.Item label="捐赠人（企业）">{detail?.invoiceEntName}</Descriptions.Item>
      <Descriptions.Item label="到期日">{detail?.ddlTime}</Descriptions.Item>
      <Descriptions.Item label="社会统一信用代码">{code}</Descriptions.Item>
      <Descriptions.Item label="持票企业">{stayCompany}</Descriptions.Item>
      <Descriptions.Item label="第一收票企业">{detail?.invoiceEntName}</Descriptions.Item>
      <Descriptions.Item label="金票金额">{detail?.price}</Descriptions.Item>
      <Descriptions.Item label="第二收票企业">{company2}</Descriptions.Item>
      <Descriptions.Item label="合同材料">
        <div>
          {!detail?.file ? (
            '暂无文件'
          ) : (
            <a
              onClick={() => {
                if (detail?.file) {
                  downloadBase64File(detail.file, detail.fileName);
                  return;
                }
              }}
              style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
              key={detail?.fileName}
            >
              <LinkOutlined style={{ marginRight: 4 }} />
              {detail?.fileName}
            </a>
          )}
        </div>
      </Descriptions.Item>
      <Descriptions.Item label="融资情况">{detail?.financingPrice || '未融资'}</Descriptions.Item>
    </Descriptions>
  );
};

export const TransferDescriptions = ({ detail = {} }) => {
  return (
    <Descriptions column={2}>
      <Descriptions.Item label="收票企业">{detail?.recEntName}</Descriptions.Item>
      <Descriptions.Item label="转让金额">{detail?.recPrice}</Descriptions.Item>
    </Descriptions>
  );
};

export const TransferDescriptions2 = ({ detail = {} }) => {
  return (
    <Descriptions column={2}>
      <Descriptions.Item label="转票企业">{detail?.fileName}</Descriptions.Item>
      <Descriptions.Item label="收票企业">{detail?.fileName}</Descriptions.Item>
      <Descriptions.Item label="转票日期">{detail?.fileName}</Descriptions.Item>
      <Descriptions.Item label="转让金额">{detail?.fileName}</Descriptions.Item>
    </Descriptions>
  );
};

export const FinanceDescriptions = ({ detail = {} }) => {
  return (
    <Descriptions column={2}>
      <Descriptions.Item label="申请金额">{detail?.financingPrice}</Descriptions.Item>
      <Descriptions.Item label="保理商">{detail?.businessName}</Descriptions.Item>
      <Descriptions.Item label="收款账号">{detail?.bankAccount}</Descriptions.Item>
      <Descriptions.Item label="开户行">{detail?.bankName}</Descriptions.Item>
    </Descriptions>
  );
};

export const PayDescriptions = ({ detail = {} }) => {
  return (
    <Descriptions column={1}>
      <Descriptions.Item label="放款日期">{detail?.payTime}</Descriptions.Item>
      <Descriptions.Item label="放款凭证">
        <div>
          {!detail?.payFile ? (
            '暂无文件'
          ) : (
            <FileUpload
              value={formatFiles([
                {
                  fileKey: uuidv4(),
                  fileName: detail?.payFileName,
                  url: detail?.payFile,
                },
              ])}
              disabled
              accept={[]}
              fileLen={1}
              uploadType={UPLOAD_TYPE.PICTURE.code}
              tooltipTitle=""
            />
          )}
        </div>
      </Descriptions.Item>
    </Descriptions>
  );
};
