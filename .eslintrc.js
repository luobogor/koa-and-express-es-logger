module.exports = {
  env: {
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended'
  ],
  rules: {
    'no-new': 'off',
    semi: [2, 'never']
  },
}
