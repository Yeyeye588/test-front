import React, { useMemo, useEffect, useState, useImperativeHandle } from 'react';
import { Button, Space, Steps } from 'antd';
import { isFunction } from 'lodash';
import { usePageProps } from '@/utils/hooks';
import StepForm from './StepsForm';
import { toArray } from './utils';

const defaultStyles = {
  marginBottom: 20,
};

const BaseStepsForm = React.forwardRef((props, ref) => {
  const {
    current = 0,
    loading = false,
    onCurrentChange = () => {},
    submitter = true, // 是否使用默认的提交按钮还是自定义，自定义时submitter.render 传入相关参数
    stepsProps, // 通过antd 的step，传入相关参数，传入null时不显示步骤条
    onFinish = () => {}, // 完成时的回调
    children,
    refreshSave = true, // 刷新保留参数， 不保留的话，默认会自动跳转第一步
    nextSave = true, // 下一步时是否保留上一步表单内容
  } = props;

  const { navigate, location, queryParams } = usePageProps();

  const [formArray] = useState(children);

  const stepNumber = useMemo(() => {
    // 刷新保留参数， 不保留的话，默认会自动跳转第一步
    if (!refreshSave) {
      return 0;
    }
    return queryParams?.step || current;
  }, [current, queryParams, refreshSave]);

  const [step, setToStep] = useState(Number(stepNumber));

  const setStep = (v) => {
    onCurrentChange(v);
    setToStep(v);
  };

  /**
   * 父组件可以手动调用上一步，下一步
   */
  useImperativeHandle(ref, () => ({
    step,
    form: children?.[step]?.ref?.current,
    onSubmit: onStepSubmit,
    onFinalSubmit: onFinalSubmit,
    onSave,
    onFinalSave,
    onPre: prePage,
    onNext: nextPage,
  }));

  useEffect(() => {
    if (children) {
      if (location.state) {
        children.forEach((f) => {
          const currentForm = f?.ref?.current;
          const children = React.Children.toArray(props.children);
          const hasRef = children.every((child) => child.ref);
          const hasGetFieldsValue = isFunction(currentForm?.getFieldsValue);
          const hasSetFieldsValue = isFunction(currentForm?.setFieldsValue);
          const hasValidateFields = isFunction(currentForm?.validateFields);
          const hasResetFields = isFunction(currentForm?.resetFields);
          if (
            !(
              hasRef &&
              hasGetFieldsValue &&
              hasSetFieldsValue &&
              hasValidateFields &&
              hasResetFields
            )
          ) {
            throw new Error(
              'BaseStepForm必须包含ref，并且ref需要包含form.getFieldsValue,form.setFieldsValue,form.validateFields,form.resetFields',
            );
          }
          currentForm.setFieldsValue(location.state);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const prePage = () => {
    if (step < 1) return;
    saveValue(step - 1);
    setStep(step - 1);
  };

  const nextPage = () => {
    if (step > formArray.length - 1) return;
    saveValue(step + 1);
    setStep(step + 1);
  };

  const pre = useMemo(() => {
    return (
      !submitter.render && (
        <Button
          key="pre"
          onClick={() => {
            prePage();
          }}
        >
          上一步
        </Button>
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, submitter]);

  const onSubmit = () => {
    const currentForm = children[step]?.ref?.current;
    return currentForm
      .validateFields()
      .then((values) => {
        return Promise.resolve(values);
      })
      .catch((errorInfo) => {
        return Promise.reject(errorInfo);
      });
  };

  const onSave = () => {
    const currentForm = children[step]?.ref?.current;
    const result = currentForm.getFieldsValue();
    console.log('当前表单保存', result);
    return Promise.resolve(result);
  };

  const onFinalSave = () => {
    const result = getAllValues();
    console.log('所有表单保存', result);
    return Promise.resolve(result);
  };

  const saveValue = async (p) => {
    if (!nextSave) {
      const currentForm = children[step]?.ref?.current;
      currentForm.resetFields();
    }

    await navigate(`${location.pathname}?step=${p}`, {
      state: nextSave ? getAllValues() : {},
      replace: true,
    });
  };

  const onStepSubmit = () => {
    return onSubmit()?.then((values) => {
      // 是否是最后一步
      if (step === children.length - 1) {
        const allValue = getAllValues();
        return onFinish(allValue);
      } else {
        nextPage();
      }
    });
  };

  const next = useMemo(() => {
    return (
      !submitter.render && (
        <Button
          key="next"
          loading={loading}
          onClick={() => {
            onStepSubmit();
          }}
          type="primary"
          htmlType="submit"
        >
          下一步
        </Button>
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, loading]);

  /**
   * 返回顶部steps， 可自定义或者传入参数
   */
  const StepsRenderDom = () => {
    return (
      <div style={defaultStyles}>
        {stepsProps !== null && <Steps current={step} {...stepsProps} />}
      </div>
    );
  };

  /**
   * 获取所有的表单的值
   * @returns
   */
  const getAllValues = () => {
    let values = {};
    children?.forEach((s, index, arr) => {
      // 倒序处理，保证前面的第一步的数据 同名能正常覆盖到第二步
      const formValue = arr?.[arr?.length - 1 - index]?.ref?.current?.getFieldsValue();
      values = {
        ...values,
        ...formValue,
      };
    });
    return values;
  };

  /**
   * 重置表单
   */
  const resetAllForm = () => {
    children?.forEach((s) => {
      s?.ref?.current?.resetFields();
    });
  };

  /**
   * 最后一步提交
   */
  const onFinalSubmit = () => {
    return onSubmit()?.then(() => {
      const allValue = getAllValues();
      return onFinish(allValue).then(() => {
        resetAllForm();
      });
    });
  };

  const submit = useMemo(() => {
    return (
      !submitter.render && (
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => {
            onFinalSubmit();
          }}
        >
          提交
        </Button>
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, onSubmit, submitter]);

  const submitterDom = useMemo(() => {
    let buttons = [];
    const index = step || 0;
    if (index < 1) {
      buttons.push(next);
    } else if (index + 1 === formArray.length) {
      buttons.push(pre, submit);
    } else {
      buttons.push(pre, next);
    }

    if (submitter && submitter.render) {
      const currentForm = children[step]?.ref?.current;
      const submitterProps = {
        form: currentForm,
        onSubmit: onStepSubmit,
        onFinalSubmit: onFinalSubmit,
        step,
        onSave,
        onFinalSave,
        onPre: prePage,
        onNext: nextPage,
      };

      return submitter.render(submitterProps);
    }

    if (submitter && submitter?.render === false) {
      return null;
    }
    return buttons;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, formArray.length, step, submitter]);

  const childrenFormDom = useMemo(() => {
    if (!children) {
      return;
    }
    return toArray(children)?.map((item, index) => {
      const itemProps = item.props;
      const name = itemProps.name || `${index}`;
      /** 是否是当前的表单 */
      const isShow = step === index;

      return (
        <div
          key={name}
          style={{
            display: isShow ? 'block' : 'none',
          }}
        >
          {React.cloneElement(item, {
            ...itemProps,
            name,
            step: index,
            key: name,
          })}
        </div>
      );
    });
  }, [children, step]);

  return (
    <div ref={ref}>
      {StepsRenderDom()}
      {childrenFormDom}
      <div>
        <Space>{submitterDom}</Space>
      </div>
    </div>
  );
});

BaseStepsForm.StepForm = StepForm;

export default BaseStepsForm;
