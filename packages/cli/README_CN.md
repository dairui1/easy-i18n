# @easyi18n/cli

## 使用方法

### 配置

@easyi18n/cli 使用 [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) 来支持配置文件。这意味着你可以通过多种方式进行配置：

1. `package.json` 中的 `easyi18n` 属性
2. JSON 或 YAML 格式的 `.easyi18nrc` 文件
3. `.easyi18nrc.json`、`.easyi18nrc.yaml`、`.easyi18nrc.yml`、`.easyi18nrc.js`、`.easyi18nrc.ts`、`.easyi18nrc.mjs` 或 `.easyi18nrc.cjs` 文件
4. `.config` 子目录下的 `easyi18nrc`、`easyi18nrc.json`、`easyi18nrc.yaml`、`easyi18nrc.yml`、`easyi18nrc.js`、`easyi18nrc.ts`、`easyi18nrc.mjs` 或 `easyi18nrc.cjs` 文件
5. `easyi18n.config.js`、`easyi18n.config.ts`、`easyi18n.config.mjs` 或 `easyi18n.config.cjs` 文件

配置文件应该导出一个包含你所需选项的对象。例如：

## 开发路线

- [ ] 支持单文件和目录格式作为入口点
- [ ] 通过自动检测入口格式（文件或目录）来简化配置
- [ ] 添加用户友好的 CLI 提示以进行配置设置
- [ ] 实现 `init` 命令以生成默认配置文件
- [ ] 为每个配置选项提供清晰的文档和示例
- [ ] 支持 react-i18next 示例项目
- [ ] 在翻译过程中正确处理复杂的 ICU 模式（如复数、选择等）
- [ ] 为 LLM 翻译输出实现 JSON 修复功能
- [ ] 改进翻译过程的错误处理和报告
- [ ] 添加对默认之外的自定义翻译服务的支持

## 本地开发

1. 启动开发服务器：
   ```
   turbo dev --filter=@easyi18n/cli
   ```

2. 开始翻译：
   ```
   cd packages/easy-i18n-cli
   node dist/cli.js -l all -f common
   ```
