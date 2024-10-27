import React, { useState } from 'react';
import { AutoComplete } from 'antd';

const { Option } = AutoComplete;

const EmailSearch = React.memo(
  ({ value, onChange = () => {}, placeholder = '请输入', ...restProps }) => {
    const [result, setResult] = useState([]);

    const mailBox = [
      'qq.com',
      '163.com',
      '126.com',
      'gmail.com',
      'yahoo.com',
      'msn.com',
      'hotmail.com',
      'aol.com',
      'ask.com',
      'live.com',
      '0355.net',
      '163.net',
      '263.net',
      '3721.net',
      'yeah',
    ];

    const handleSearch = (v) => {
      let res = [];
      if (v) {
        const suffixIndex = v?.indexOf('@');
        if (suffixIndex > 0) {
          const suffix = v?.substring(suffixIndex + 1);
          const val = v?.substring(0, suffixIndex);
          res = mailBox
            .map((domain) => (domain?.indexOf(suffix) === 0 ? `${val}@${domain}` : null))
            .filter((i) => i);
        } else {
          res = mailBox.map((domain) => `${v}@${domain}`);
        }
      }
      setResult(res);
    };

    return (
      <AutoComplete
        style={{
          width: '100%',
        }}
        onSearch={handleSearch}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        {...restProps}
      >
        {result.map((email) => (
          <Option key={email} value={email}>
            {email}
          </Option>
        ))}
      </AutoComplete>
    );
  },
);

export default EmailSearch;
