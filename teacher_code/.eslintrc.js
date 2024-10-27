module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
    PROJECT_KEY: true,
    ZW_APP_KEY: true,
    SUCCESS_CODE: true,
    ENV: true,
    TOKEN_KEY: true,
    ICON_FONT_URL: true,
    AMAP_CONFIG: true,
  },
  rules: {
    'no-plusplus': 0,
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 0,
    'no-unused-vars': 1,
    'no-undef': 'error',
  },
};
