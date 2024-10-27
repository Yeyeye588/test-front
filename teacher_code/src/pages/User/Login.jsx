import { history, useModel } from '@umijs/max';
import { Button } from 'antd';
import { flushSync } from 'react-dom';
import styles from './index.less';

export const userList = [
  {
    name: '杭州核心企业有限公司',
    role: '核心企业',
    code: '91500112MAACCA5X01',
    hasRoutesKeys: ['first', 'ticket'],
    roleType: '1',
    operate: ['开票待确权', '开票待初审', '开票待签收', '正常持有', '融资待收款'],
  },
  {
    name: '杭州保理有限公司',
    role: '保理商',
    code: '91500112MAACCA5X02',
    hasRoutesKeys: ['second','ticket'],
    roleType: '3',
    operate: ['开票待复审', '融资待放款'],
  },
  {
    name: '浙江贸易有限公司',
    role: '一级供应商',
    code: '91500112MAACCA5X03',
    hasRoutesKeys: ['ticket'],
    roleType: '2',
    operate: ['开票待确权', '开票待签收', '正常持有', '转让待签收', '融资待收款'],
  },
];

const Login = () => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const handleLoginAs = async (user) => {
    flushSync(() => {
      setInitialState((s) => ({
        ...s,
        currentUser: user,
      }));
    });
    localStorage.setItem('bank-chain-user', JSON.stringify(user));
    history.push('/' + user.hasRoutesKeys?.[0]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
      <span className={styles.header1}>区块链·</span>
      <span className={styles.header2}>捐赠追溯平台</span>
      </div>
      <div className={styles.header3}>“链见善行”——搭建更加透明安全的慈善捐赠平台
      </div>
      <div className={styles.content}>

         <div className={styles.login}>
          <div className={styles.welcome}>欢迎来到,区块链捐赠追溯平台</div>
          <h3 className={styles.loginName}>请选择你的身份</h3>
          <div className={styles.userList}>
            {userList.map((user, index) => {
              return (
                 <div> {/* 或者使用 <> 和 </> 作为 JSX 片段 */}
                    <Button type="primary" onClick={() => handleLoginAs(user)} key={index}>
                      {user.role}
                    </Button>
                  </div>
              );

            })}
          </div>
         </div>
         </div>
         <div className={styles.title}>服务优势</div>
         <div className={styles.advantage}>
         <div className={styles.box}>
         <div className={styles.t1}>透明</div>
         <div className={styles.child}>
         <span>确保每笔捐款的流向都可以被追踪</span>
         <span>捐赠者能够实时查看资金的接收和使用情况</span>
         <span>了解资金如何被分配到具体的项目和受益人</span>
         </div>
         </div>
         <div>

         </div>

      </div>
    </div>
  );
};
export default Login;
