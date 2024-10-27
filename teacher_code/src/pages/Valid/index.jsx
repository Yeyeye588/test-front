import React, { useEffect, useState } from 'react';
import { Button, Card, Descriptions, Input, message } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { formatTimeToDateSecond } from '@/utils/format';
import { usePageProps } from '@/utils/hooks';
import { fetchSealQueryByHash } from '@/services/api';
import styles from './index.less';

const Valid = () => {
  const { queryParams = {} } = usePageProps();
  const [hash, setHash] = useState('');

  useEffect(() => {
    if (queryParams.hash) {
      setHash(queryParams.hash);
    }
  }, [queryParams]);

  const [detail, setDetail] = useState({});
  const [loading, setLoading] = useState(false);

  const handleHash = () => {
    if (!hash) {
      message.error('请输入交易哈希!');
      return;
    }
    setLoading(true);
    fetchSealQueryByHash({
      hash,
    })
      .then((res) => {
        setDetail(res.data || {});
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <PageContainer title="链上验证">
      <Card>
        <h1>智能印章链上数据查询验证</h1>
        {!detail.hash && (
          <>
            <div className={styles.search}>
              <div className={styles.content}>
                <span>交易哈希</span>
                <Input
                  placeholder="请输入交易哈希进行查询"
                  value={hash}
                  size="large"
                  onChange={(e) => setHash(e.target.value)}
                />
              </div>
              <div className={styles.tips}>温馨提示：交易哈希可在用印记录中查看获取</div>
              <Button type="primary" onClick={() => handleHash()} loading={loading} size="large">
                立即查询
              </Button>
            </div>
          </>
        )}

        {detail?.hash && (
          <div className={styles.info}>
            <Card>
              <Descriptions title="用印记录" column={1}>
                <Descriptions.Item label="用印人">用印申请人张某</Descriptions.Item>
                <Descriptions.Item label="用印时间">
                  {formatTimeToDateSecond(detail?.useDate)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card style={{ margin: '20px 0' }}>
              <Descriptions title="区块链信息" column={1}>
                <Descriptions.Item label="区块号">{detail?.blockNumber}</Descriptions.Item>
                <Descriptions.Item label="上链时间">
                  {formatTimeToDateSecond(detail?.blockTime)}
                </Descriptions.Item>
                <Descriptions.Item label="交易哈希">{detail?.hash}</Descriptions.Item>
              </Descriptions>
            </Card>
            <Button
              type="primary"
              onClick={() => {
                setDetail({});
              }}
              size="large"
            >
              重新查询
            </Button>
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default Valid;
