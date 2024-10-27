import React, { forwardRef, useImperativeHandle } from 'react';
import { Form } from 'antd';

const StepForm = forwardRef((props, ref) => {
  const [formRef] = Form.useForm();

  useImperativeHandle(ref, () => ({
    ...formRef,
  }));

  return <Form form={formRef} layout="vertical" {...props} />;
});
export default React.memo(StepForm);
