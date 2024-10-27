const fabric = require('@umijs/fabric');

module.exports = {
  ...fabric.prettier,
  importOrder: [
    'react',
    'antd',
    '@ant-design',
    '@umi',
    '<THIRD_PARTY_MODULES>',
    '^@/components/(.*)$',
    '^@/utils/(.*)$',
    '^@/common/(.*)$',
    '^@/assets/(.*)$',
    '^@/services/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: false,
};
