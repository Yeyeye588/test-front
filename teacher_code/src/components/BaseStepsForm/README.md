## BaseStepsForm 分布表单组件

### BaseStepsForm API

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| current | 0 | 默认步骤条的数值 |
| loading | false | 加载中 |
| onCurrentChange | () => { } | 步骤条变化时的回调函数 |
| onFinish | (v) => {} | 完成时的回调函数，可以取到所有的值 |
| submitter | true | 是否使用默认的提交按钮还是自定义，自定义时 submitter.render 传入相关参数 |
| stepsProps | - | 过 antd 的 step，传入相关参数，传入 null 时不显示步骤条 |
| children | - | 表单内容 |
| refreshSave | true | 刷新保留参数， 不保留的话，默认会自动跳转第一步 |
| nextSave | true | 下一步时是否保留上一步表单内容 |

### ref 上的方法

BaseStepsForm 绑定 ref 可获取的方法以及值

| 参数          | 默认值    | 说明                         |
| ------------- | --------- | ---------------------------- |
| form          | -         | 当前表单 ref                 |
| onSubmit      | () => {}  | 提交当前表单                 |
| onFinalSubmit | () => { } | 提交所有表单，获取相应表单值 |
| step          | 0         | 当前步骤                     |
| onSave        | () => {}  | 保存当前表单                 |
| onFinalSave   | () => {}  | 保存所有表单                 |
| onPre         | () => {}  | 上一步                       |
| onNext        | () => {}  | 下一步                       |

### 子表单

需要通过 BaseStepsForm.StepForm 包裹，并且在 ref 传入 React.useRef()

```jsx
<BaseStepsForm.StepForm name="test1" ref={React.useRef()}>
  <Form.Item
    name="mobile"
    label="联系方式"
    rules={getNormalRules('联系方式', {
      required: true,
    })}
    validateTrigger="onBlur"
    validateFirst
  >
    <Input placeholder="请输入" />
  </Form.Item>
</BaseStepsForm.StepForm>
```

### 使用方式

#### 1、步骤条使用默认 antd 组件

主要通过 stepsProps 传入 step 的相关参数，具体参数参考 antd 的 step 组件 https://4x.ant.design/components/steps-cn/#API

```jsx
import React, { useRef, useState, useEffect } from 'react';
import { Form, Input, Card, Button, message, Result } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useInterval } from 'ahooks';
import BaseStepsForm from '@/components/BaseStepsForm';
import { usePageProps } from '@/utils/hooks';
import { PATTERN } from '@/common/pattern';
import { getNormalRules } from '@/common/project';

const StepForm = () => {
  const { route = {}, params = {}, history, navigate, location } = usePageProps();
  // 处理倒计时跳转
  const [interval, setInterval] = useState(undefined);
  const [count, setCount] = useState(5);

  const stepFormRef = useRef();

  // 随机成功失败
  const handleFinalSubmit = (v) => {
    console.log('values', v);
    return new Promise((resolve, reject) => {
      const random = Math.random();
      if (random > 0.5) {
        message.error('提交失败');
        reject();
      } else {
        message.success('提交成功');
        resolve();
      }
    });
  };

  const handleGo = () => {
    history.push('/templates/pro-list');
  };

  useInterval(
    () => {
      if (count > 0) {
        setCount(count - 1);
      }
      if (count === 0) {
        setInterval(undefined);
        handleGo();
      }
    },
    interval,
    {
      immediate: false,
    },
  );

  return (
    <PageContainer breadcrumb={null} title="分布表单">
      <Card>
        <BaseStepsForm
          ref={stepFormRef}
          onCurrentChange={(v) => {
            setParentStep(v);
          }}
          stepsProps={{
            items: [
              {
                title: '第一步',
              },
              {
                title: '第二步',
              },
              {
                title: '第三步',
              },
            ],
          }}
          onFinish={(v) => {
            return handleFinalSubmit(v);
          }}
          submitter={{
            render: (props) => {
              if (props.step === 0) {
                return (
                  <Button
                    type="primary"
                    onClick={() => {
                      // 提交当前表单, 并且跳转下一步
                      props.onSubmit?.();
                    }}
                  >
                    去第二步 {'>'}
                  </Button>
                );
              }

              if (props.step === 1) {
                return [
                  <Button key="pre" onClick={() => props.onPre?.()}>
                    返回第一步
                  </Button>,
                  <Button key="save1" onClick={() => props.onSave?.()}>
                    保存当前表单
                  </Button>,
                  <Button key="save2" onClick={() => props.onFinalSave?.()}>
                    保存所有表单
                  </Button>,
                  <Button
                    type="primary"
                    key="next"
                    onClick={() =>
                      // 提交所有表单, 并且跳转下一步
                      props.onFinalSubmit?.()?.then(() => {
                        props?.onNext();
                      })
                    }
                  >
                    结束 {'>'}
                  </Button>,
                ];
              }

              if (props.step === 2) {
                setInterval(1000);
                return [];
              }

              return [null];
            },
          }}
        >
          <BaseStepsForm.StepForm name="test1" ref={React.useRef()}>
            <Form.Item
              name="mobile"
              label="联系方式"
              rules={getNormalRules('联系方式', {
                // pattern: PATTERN.PHONE,
                // validateLen: false,
                required: true,
              })}
              validateTrigger="onBlur"
              validateFirst
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </BaseStepsForm.StepForm>
          <BaseStepsForm.StepForm name="test2" ref={React.useRef()}>
            <Form.Item
              name="mobile2"
              label="联系方式2"
              rules={getNormalRules('联系方式2', {
                // pattern: PATTERN.PHONE,
                // validateLen: false,
                required: true,
              })}
              validateTrigger="onBlur"
              validateFirst
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </BaseStepsForm.StepForm>
          <BaseStepsForm.StepForm name="test3" ref={React.useRef()}>
            <Result
              status="success"
              title="提交成功!"
              subTitle={`提交成功，${count}s 后自动跳转列表页面， 或点击按钮跳转`}
              extra={[
                <Button key="buy" onClick={handleGo}>
                  返回
                </Button>,
              ]}
            />
          </BaseStepsForm.StepForm>
        </BaseStepsForm>
      </Card>
    </PageContainer>
  );
};

export default StepForm;
```

#### 2、使用自定义步骤条

通过 stepsProps 传入参数为 null，并且为 BaseStepsForm 绑定 ref，可以拿到当前的步骤，以及提供方法，onNext， onPre，可以上一步，下一步。

```jsx
import React, { useRef, useState, useEffect } from 'react';
import { Form, Input, Card, Button, message, Result } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useInterval } from 'ahooks';
import BaseStepsForm from '@/components/BaseStepsForm';
import { usePageProps } from '@/utils/hooks';
import { PATTERN } from '@/common/pattern';
import { getNormalRules } from '@/common/project';
import TemplatesForm from './components/ProForm';

const StepForm = () => {
  const { route = {}, params = {}, history, navigate, location } = usePageProps();
  // 处理倒计时跳转
  const [interval, setInterval] = useState(undefined);
  const [count, setCount] = useState(5);

  const stepFormRef = useRef();

  // 随机成功失败
  const handleFinalSubmit = (v) => {
    console.log('values', v);
    return new Promise((resolve, reject) => {
      const random = Math.random();
      if (random > 0.5) {
        message.error('提交失败');
        reject();
      } else {
        message.success('提交成功');
        resolve();
      }
    });
  };

  const handleGo = () => {
    history.push('/templates/pro-list');
  };

  useInterval(
    () => {
      if (count > 0) {
        setCount(count - 1);
      }
      if (count === 0) {
        setInterval(undefined);
        handleGo();
      }
    },
    interval,
    {
      immediate: false,
    },
  );

  // 解决自定义步骤条,可以通过stepsProps 传入null，然后再上面自定义步骤条
  const [parentStep, setParentStep] = useState(stepFormRef?.current?.step || 0);
  useEffect(() => {
    setParentStep(stepFormRef?.current?.step || 0);
  }, []);

  return (
    <PageContainer breadcrumb={null} title="分布表单">
      <Card>
        <div>自定义一些步骤条{parentStep}</div>
        <BaseStepsForm
          ref={stepFormRef}
          onCurrentChange={(v) => {
            setParentStep(v);
          }}
          stepsProps={null}
          onFinish={(v) => {
            return handleFinalSubmit(v);
          }}
          submitter={{
            render: (props) => {
              if (props.step === 0) {
                return (
                  <Button
                    type="primary"
                    onClick={() => {
                      // 提交当前表单, 并且跳转下一步
                      props.onSubmit?.();
                    }}
                  >
                    去第二步 {'>'}
                  </Button>
                );
              }

              if (props.step === 1) {
                return [
                  <Button key="pre" onClick={() => props.onPre?.()}>
                    返回第一步
                  </Button>,
                  <Button key="save1" onClick={() => props.onSave?.()}>
                    保存当前表单
                  </Button>,
                  <Button key="save2" onClick={() => props.onFinalSave?.()}>
                    保存所有表单
                  </Button>,
                  <Button
                    type="primary"
                    key="next"
                    onClick={() =>
                      // 提交所有表单, 并且跳转下一步
                      props.onFinalSubmit?.()?.then(() => {
                        props?.onNext();
                      })
                    }
                  >
                    结束 {'>'}
                  </Button>,
                ];
              }

              if (props.step === 2) {
                setInterval(1000);
                return [];
              }

              return [null];
            },
          }}
        >
          <BaseStepsForm.StepForm name="test1" ref={React.useRef()}>
            <Form.Item
              name="mobile"
              label="联系方式"
              rules={getNormalRules('联系方式', {
                // pattern: PATTERN.PHONE,
                // validateLen: false,
                required: true,
              })}
              validateTrigger="onBlur"
              validateFirst
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </BaseStepsForm.StepForm>
          <BaseStepsForm.StepForm name="test2" ref={React.useRef()}>
            <Form.Item
              name="mobile2"
              label="联系方式2"
              rules={getNormalRules('联系方式2', {
                // pattern: PATTERN.PHONE,
                // validateLen: false,
                required: true,
              })}
              validateTrigger="onBlur"
              validateFirst
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </BaseStepsForm.StepForm>
          <BaseStepsForm.StepForm name="test3" ref={React.useRef()}>
            <Result
              status="success"
              title="提交成功!"
              subTitle={`提交成功，${count}s 后自动跳转列表页面， 或点击按钮跳转`}
              extra={[
                <Button key="buy" onClick={handleGo}>
                  返回
                </Button>,
              ]}
            />
          </BaseStepsForm.StepForm>
        </BaseStepsForm>
      </Card>
    </PageContainer>
  );
};

export default StepForm;
```

#### 3. 使用默认的 render 底部提交

submitter 不传，使用默认 true，就会出现底部的每一步的按钮，第一步默认有下一步，后续为上一步，下一步，最后一步为上一步和提交。在 onFinish 可以获取当前所有表单的值。

```jsx
import React, { useRef, useState, useEffect } from 'react';
import { Form, Input, Card, Button, message, Result } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useInterval } from 'ahooks';
import BaseStepsForm from '@/components/BaseStepsForm';
import { usePageProps } from '@/utils/hooks';
import { PATTERN } from '@/common/pattern';
import { getNormalRules } from '@/common/project';
import TemplatesForm from './components/ProForm';

const StepForm = () => {
  const { route = {}, params = {}, history, navigate, location } = usePageProps();
  // 处理倒计时跳转
  const [interval, setInterval] = useState(undefined);
  const [count, setCount] = useState(5);

  const stepFormRef = useRef();

  // 随机成功失败
  const handleFinalSubmit = (v) => {
    console.log('values', v);
    return new Promise((resolve, reject) => {
      const random = Math.random();
      if (random > 0.5) {
        message.error('提交失败');
        reject();
      } else {
        message.success('提交成功');
        resolve();
      }
    });
  };

  const handleGo = () => {
    history.push('/templates/pro-list');
  };

  useInterval(
    () => {
      if (count > 0) {
        setCount(count - 1);
      }
      if (count === 0) {
        setInterval(undefined);
        handleGo();
      }
    },
    interval,
    {
      immediate: false,
    },
  );

  // 解决自定义步骤条,可以通过stepsProps 传入null，然后再上面自定义步骤条
  const [parentStep, setParentStep] = useState(stepFormRef?.current?.step || 0);
  useEffect(() => {
    setParentStep(stepFormRef?.current?.step || 0);
  }, []);

  return (
    <PageContainer breadcrumb={null} title="分布表单">
      <Card>
        <div>自定义一些步骤条{parentStep}</div>
        <BaseStepsForm
          ref={stepFormRef}
          onCurrentChange={(v) => {
            setParentStep(v);
          }}
          stepsProps={{
            items: [
              {
                title: '第一步',
              },
              {
                title: '第二步',
              },
              {
                title: '第三步',
              },
            ],
          }}
          onFinish={(v) => {
            return handleFinalSubmit(v);
          }}
        >
          <BaseStepsForm.StepForm name="test1" ref={React.useRef()}>
            <Form.Item
              name="mobile"
              label="联系方式"
              rules={getNormalRules('联系方式', {
                // pattern: PATTERN.PHONE,
                // validateLen: false,
                required: true,
              })}
              validateTrigger="onBlur"
              validateFirst
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </BaseStepsForm.StepForm>
          <BaseStepsForm.StepForm name="test2" ref={React.useRef()}>
            <Form.Item
              name="mobile2"
              label="联系方式2"
              rules={getNormalRules('联系方式2', {
                // pattern: PATTERN.PHONE,
                // validateLen: false,
                required: true,
              })}
              validateTrigger="onBlur"
              validateFirst
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </BaseStepsForm.StepForm>
          <BaseStepsForm.StepForm name="test3" ref={React.useRef()}>
            <Result
              status="success"
              title="提交成功!"
              subTitle={`提交成功，${count}s 后自动跳转列表页面， 或点击按钮跳转`}
              extra={[
                <Button key="buy" onClick={handleGo}>
                  返回
                </Button>,
              ]}
            />
          </BaseStepsForm.StepForm>
        </BaseStepsForm>
      </Card>
    </PageContainer>
  );
};

export default StepForm;
```

#### 5. 使用自定义底部按钮

通过 submitter 的 render，根据 props.step === 相关步骤，默认从 0 开始，return 相应函数。

props 默认提供的方法与属性有以下

| 参数          | 默认值    | 说明                         |
| ------------- | --------- | ---------------------------- |
| form          | -         | 当前表单 ref                 |
| onSubmit      | () => {}  | 提交当前表单                 |
| onFinalSubmit | () => { } | 提交所有表单，获取相应表单值 |
| step          | 0         | 当前步骤                     |
| onSave        | () => {}  | 保存当前表单                 |
| onFinalSave   | () => {}  | 保存所有表单                 |
| onPre         | () => {}  | 上一步                       |
| onNext        | () => {}  | 下一步                       |

```jsx
import React, { useRef, useState, useEffect } from 'react';
import { Form, Input, Card, Button, message, Result } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useInterval } from 'ahooks';
import BaseStepsForm from '@/components/BaseStepsForm';
import { usePageProps } from '@/utils/hooks';
import { PATTERN } from '@/common/pattern';
import { getNormalRules } from '@/common/project';
import TemplatesForm from './components/ProForm';

const StepForm = () => {
  const { route = {}, params = {}, history, navigate, location } = usePageProps();
  // 处理倒计时跳转
  const [interval, setInterval] = useState(undefined);
  const [count, setCount] = useState(5);

  const stepFormRef = useRef();

  // 随机成功失败
  const handleFinalSubmit = (v) => {
    console.log('values', v);
    return new Promise((resolve, reject) => {
      const random = Math.random();
      if (random > 0.5) {
        message.error('提交失败');
        reject();
      } else {
        message.success('提交成功');
        resolve();
      }
    });
  };

  const handleGo = () => {
    history.push('/templates/pro-list');
  };

  useInterval(
    () => {
      if (count > 0) {
        setCount(count - 1);
      }
      if (count === 0) {
        setInterval(undefined);
        handleGo();
      }
    },
    interval,
    {
      immediate: false,
    },
  );

  // 解决自定义步骤条,可以通过stepsProps 传入null，然后再上面自定义步骤条
  const [parentStep, setParentStep] = useState(stepFormRef?.current?.step || 0);
  useEffect(() => {
    setParentStep(stepFormRef?.current?.step || 0);
  }, []);

  return (
    <PageContainer breadcrumb={null} title="分布表单">
      <Card>
        <div>自定义一些步骤条{parentStep}</div>
        <BaseStepsForm
          ref={stepFormRef}
          onCurrentChange={(v) => {
            setParentStep(v);
          }}
          stepsProps={{
            items: [
              {
                title: '第一步',
              },
              {
                title: '第二步',
              },
              {
                title: '第三步',
              },
            ],
          }}
          onFinish={(v) => {
            return handleFinalSubmit(v);
          }}
          submitter={{
            render: (props) => {
              if (props.step === 0) {
                return (
                  <Button
                    type="primary"
                    onClick={() => {
                      // 提交当前表单, 并且跳转下一步
                      props.onSubmit?.();
                    }}
                  >
                    去第二步 {'>'}
                  </Button>
                );
              }

              if (props.step === 1) {
                return [
                  <Button key="pre" onClick={() => props.onPre?.()}>
                    返回第一步
                  </Button>,
                  <Button key="save1" onClick={() => props.onSave?.()}>
                    保存当前表单
                  </Button>,
                  <Button key="save2" onClick={() => props.onFinalSave?.()}>
                    保存所有表单
                  </Button>,
                  <Button
                    type="primary"
                    key="next"
                    onClick={() =>
                      // 提交所有表单, 并且跳转下一步
                      props.onFinalSubmit?.()?.then(() => {
                        props?.onNext();
                      })
                    }
                  >
                    结束 {'>'}
                  </Button>,
                ];
              }

              if (props.step === 2) {
                setInterval(1000);
                return [];
              }

              return [null];
            },
          }}
        >
          <BaseStepsForm.StepForm name="test1" ref={React.useRef()}>
            <Form.Item
              name="mobile"
              label="联系方式"
              rules={getNormalRules('联系方式', {
                // pattern: PATTERN.PHONE,
                // validateLen: false,
                required: true,
              })}
              validateTrigger="onBlur"
              validateFirst
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </BaseStepsForm.StepForm>
          <BaseStepsForm.StepForm name="test2" ref={React.useRef()}>
            <Form.Item
              name="mobile2"
              label="联系方式2"
              rules={getNormalRules('联系方式2', {
                // pattern: PATTERN.PHONE,
                // validateLen: false,
                required: true,
              })}
              validateTrigger="onBlur"
              validateFirst
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </BaseStepsForm.StepForm>
          <BaseStepsForm.StepForm name="test3" ref={React.useRef()}>
            <Result
              status="success"
              title="提交成功!"
              subTitle={`提交成功，${count}s 后自动跳转列表页面， 或点击按钮跳转`}
              extra={[
                <Button key="buy" onClick={handleGo}>
                  返回
                </Button>,
              ]}
            />
          </BaseStepsForm.StepForm>
        </BaseStepsForm>
      </Card>
    </PageContainer>
  );
};

export default StepForm;
```
