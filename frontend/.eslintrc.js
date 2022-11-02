module.exports = {
  root: true,
  env: {
    // this section will be used to determine which APIs are available to us
    // (i.e are we running in a browser environment or a node.js env)
    node: true,
    browser: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
    // specifying a module sourcetype prevent eslint from marking import statements as errors
    sourceType: 'module',
  },
  extends: [
    // use the recommended rule set for both plain javascript and vue
    'eslint:recommended',
    'plugin:vue/recommended',
    'plugin:vue/strongly-recommended',
  ],
  rules: {
    // we should always disable console logs and debugging in production
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': 'off',
    'vue/no-unused-components': 'off',
    'max-len': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    'vue/no-v-html': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-param-reassign': 'off',
    'prefer-rest-params': 'off',
    'require-atomic-updates': 'off',
    'no-console': 'off',
    indent: [1, 4, { SwitchCase: 1 }],
    'vue/html-closing-bracket-newline': [
      'error',
      {
        multiline: 'never',
      },
    ],
  },
}
