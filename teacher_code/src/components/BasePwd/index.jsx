import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Form, Input, Popover } from 'antd';
import { CheckCircleOutlined, LockOutlined } from '@ant-design/icons';
import { CRYPTO_TYPE, encode } from './encrypt';

// 字符类型为2个的规则
export const TWO_PWD_RULES = {
  len: {
    desc: '长度为8-20个字符',
    minLen: 8,
    maxLen: 20,
  },
  whitespace: {
    desc: '字母、数字和特殊符号!@#$%^&*?,.(){}[]|（除空格）',
    pattern: /^[\dA-z!@#$%^&*?,.(){}[\]|,.]+$/,
  },
  symbol: {
    desc: '字母、数字和标点符号至少包含两种',
    pattern: /(?!^(\d+|[a-zA-Z]+|[!@#$%^&*?,.(){}[\]|]+)$)^[\w!@#$%^&*?(){}[\]|,.]{1,}$/,
  },
};

// 字符类型为3个的规则
export const THREE_PWD_RULES = {
  len: {
    desc: '长度为8-20个字符',
    minLen: 8,
    maxLen: 20,
  },
  whitespace: {
    desc: '字母、数字和特殊符号!@#$%^&*?,.(){}[]|（除空格）',
    pattern: /^[\dA-z!@#$%^&*?,.(){}[\]|,.]+$/,
  },
  symbol: {
    desc: '大写字母、小写字母、数字和标点符号至少包含3种',
    pattern:
      /^(?![0-9a-z]+$)(?![0-9A-Z]+$)(?![0-9!@#$%^&*?,.(){}[\]|]+$)(?![a-z!@#$%^&*?,.(){}[\]|]+$)(?![a-zA-Z]+$)(?![A-Z!@#$%^&*?,.(){}[\]|]+$)[\w!@#$%^&*?,.(){}[\]|]{1,}$/,
  },
};
const PwdForm = forwardRef(
  (
    {
      keysMap = {
        newPwd: 'newPwd',
        oldPwd: 'oldPwd',
        confirmPwd: 'confirmPwd',
      },
      encodePwd = true, // 密码加密
      encodeType = CRYPTO_TYPE.SHA, // 加密类型
      hideOldPwd = false, // 隐藏旧密码填写
      icon = <LockOutlined />,
      customPwdRules = null, // 如有参考{len, whitespace, symbol}
      symbolNum = 3, // 字符类型个数
      hiddenLabel = false, // 是否隐藏标题
      initPwd = false, // 初次创建密码
      size = 'middle', // 输入框尺寸
      customForm = null, // 自定义form，不包含FormWrapper,Form在外部定义
    },
    ref,
  ) => {
    const [currentForm] = Form.useForm();
    const form = customForm || currentForm;
    const [visible, setVisible] = useState(false);

    const pwdRules = symbolNum === 3 ? THREE_PWD_RULES : TWO_PWD_RULES;

    /**
     * 格式化密码
     * @param {*} values
     * @returns
     */
    const formatFieldsValue = (values) => {
      const { newPwd, oldPwd, confirmPwd } = values || {};
      const obj = hideOldPwd
        ? {}
        : {
            [keysMap.oldPwd]: encodePwd ? encode(newPwd, encodeType) : oldPwd,
          };
      return {
        ...obj,
        [keysMap.newPwd]: encodePwd ? encode(newPwd, encodeType) : newPwd,
        [keysMap.confirmPwd]: encodePwd ? encode(newPwd, encodeType) : confirmPwd,
      };
    };

    useImperativeHandle(ref, () => ({
      getFieldsValue: form.getFieldsValue,
      setFieldsValue: form.setFieldValue,
      resetFields: form.resetFields,
      values: formatFieldsValue(form.getFieldsValue),
      validateFields: form.validateFields,
      formatFieldsValue,
    }));

    const getPasswordStatus = (value) => {
      const passwordStatus = {
        whitespace: false,
        len: false,
        symbol: false,
      };
      if (value) {
        const rules = customPwdRules || pwdRules;
        if (value.match(rules.whitespace.pattern)) {
          passwordStatus.whitespace = true;
        }
        if (value.length >= rules.len.minLen && value.length <= rules.len.maxLen) {
          passwordStatus.len = true;
        }
        if (value.match(rules.symbol.pattern)) {
          passwordStatus.symbol = true;
        }
        return passwordStatus;
      }
      return passwordStatus;
    };

    const renderPasswordProgress = (value) => {
      const passwordStatus = getPasswordStatus(value);
      const rules = customPwdRules || pwdRules;
      const TextArray = {
        len: rules.len.desc,
        whitespace: rules.whitespace.desc,
        symbol: rules.symbol.desc,
      };
      return value && value.length ? (
        <>
          {Object.keys(TextArray).map((key) => (
            <div key={key} style={{ display: 'flex', margin: '8px 0' }}>
              <div>
                <CheckCircleOutlined
                  style={{
                    color: passwordStatus[key] === true ? '#2E994E' : 'rgba(21,21,61,0.2)',
                    marginRight: '4px',
                  }}
                />
              </div>
              <div>{TextArray[key]}</div>
            </div>
          ))}
        </>
      ) : null;
    };

    const checkPassword = (_, value) => {
      if (value) {
        if (!visible) {
          setVisible(true);
        }
        const passwordStatus = getPasswordStatus(value);
        let errorFlag = false;
        Object.keys(passwordStatus).forEach((key) => {
          if (passwordStatus[key] === false) {
            errorFlag = true;
          }
        });
        if (errorFlag) {
          if (!visible) {
            setVisible(true);
          }
          return Promise.reject(new Error('密码设置不符合要求'));
        }
        return Promise.resolve();
      }
      setVisible(false);
      return Promise.resolve();
    };

    const handlePassBlur = () => {
      setVisible(false);
    };

    const ChildForm = (
      <>
        {!hideOldPwd && (
          <Form.Item
            name="oldPwd"
            label={hiddenLabel ? '' : '原密码'}
            rules={[
              {
                required: true,
                message: '请输入原密码',
              },
            ]}
          >
            <Input.Password
              placeholder="请输入原密码"
              autoComplete="off"
              prefix={icon}
              size={size}
            />
          </Form.Item>
        )}
        <Form.Item
          required
          label={hiddenLabel ? '' : initPwd ? '密码' : '新密码'}
          shouldUpdate={(prevValues, currentValues) => prevValues.newPwd !== currentValues.newPwd}
        >
          {({ getFieldValue }) => (
            <Popover
              content={
                <div style={{ padding: '4px 0' }}>
                  {renderPasswordProgress(getFieldValue('newPwd'))}
                </div>
              }
              trigger="focus"
              placement="right"
              open={visible}
            >
              <Form.Item
                name="newPwd"
                noStyle
                rules={[
                  {
                    required: true,
                    message: initPwd ? '请设置密码' : '请输入新密码',
                  },
                  {
                    validator: checkPassword,
                  },
                ]}
              >
                <Input.Password
                  placeholder={initPwd ? '请设置密码' : '请输入新密码'}
                  autoComplete="new-password"
                  onBlur={handlePassBlur}
                  prefix={icon}
                  size={size}
                />
              </Form.Item>
            </Popover>
          )}
        </Form.Item>
        <Form.Item
          name="confirmPwd"
          label={hiddenLabel ? '' : '确认密码'}
          dependencies={['newPwd']}
          rules={[
            {
              required: true,
              message: '请再次输入密码',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPwd') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="请再次输入密码"
            autoComplete="new-password"
            prefix={icon}
            size={size}
          />
        </Form.Item>
      </>
    );

    if (customForm) {
      return ChildForm;
    }

    return (
      <Form form={form} name="pwd">
        {ChildForm}
      </Form>
    );
  },
);
export default React.memo(PwdForm);
