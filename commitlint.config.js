/*
 * @Desc: 提交规范配置文件
 * @Author: yanjiao.lu@zhenai.com
 * @Date: 2022-05-16 16:52:23
 * @Last Modified by: yanjiao.lu@zhenai.com
 * @Last Modified time: 2022-05-20 19:29:01
 */
// 校验commit消息是否符合规范
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // rule由name和配置数组组成，
    // 如：'name:[0, 'always', 72]'，
    // 数组中第一位为level，可选0,1,2，0为disable，1为warning，2为error，
    // 第二位为应用与否，可选always | never，
    // 第三位该rule的值。
    'header-max-length': [0, 'always', 72],
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能（feature）
        'fix', // 修补 bug
        'docs', // 文档（documentation）
        'style', // 格式（不影响代码运行的变动）
        'refactor', // 重构（即不是新增功能，也不是修改bug的代码变动）
        'test', // 增加测试
        'build', // 影响构建系统或外部依赖项的更改（webpack，npm等）
        'ci', // 对CI配置文件和脚本的更改
        'revert', // 回滚
        'config', // 构建过程或辅助工具的变动
        'chore', // 其他改动
      ],
    ],
    'type-empty': [2, 'never'], // 提交类型是否允许为空
    'subject-empty': [2, 'never'], // 提交说明内容是否允许为空
  },
}
