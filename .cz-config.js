module.exports = {
  types: [
    {
      value: 'feat',
      name: 'feat: 新增功能',
    },
    {
      value: 'fix',
      name: 'fix: 修复bug',
    },
    {
      value: 'docs',
      name: 'docs: 文档',
    },
    {
      value: 'style',
      name: 'style: 不影响代码含义的修改，比如空格、格式化、缺失的分号等',
    },
    {
      value: 'refactor',
      name: 'refactor: 代码重构(既不是修复bug,也不是添加新功能)',
    },
    {
      value: 'test',
      name: 'test: 增加测试',
    },
    {
      value: 'build',
      name: 'build: 对构建系统或者外部依赖项进行了修改（webpack，npm等）',
    },
    {
      value: 'ci',
      name: 'ci: 对CI配置文件和脚本的更改',
    },
    {
      value: 'revert',
      name: 'revert: 回退',
    },
    {
      value: 'config',
      name: 'config: 构建过程或辅助工具的变动',
    },
    {
      value: 'chore',
      name: 'chore: 其他改动',
    },
  ],
  messages: {
    type: '请选择提交类型(必填)',
    customScope: '请输入文件修改范围(必填)',
    subject: '请简要描述提交(必填)',
    body: '请输入详细描述(可选)',
    confirmCommit: '确定提交此说明吗？',
  },

  scopes: [ // 根据项目添加 scope
    { name: '公共模块' },
    { name: '客户端' },
    { name: '服务端' },
  ],
  allowCustomScopes: 'custom', // 允许用户自己输入模块
  allowBreakingChanges: ['feat', 'fix'],
  skipQuestions: ['footer', 'skip', 'breaking'], // 跳过这几个问题
  subjectLimit: 120,
};
