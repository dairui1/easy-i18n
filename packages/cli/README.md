# @easyi18n/cli

## Usage

### Configuration

@easyi18n/cli uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for configuration file support. This means you can configure it in multiple ways:

1. `easyi18n` property in `package.json`
2. `.easyi18nrc` file in JSON or YAML format
3. `.easyi18nrc.json`, `.easyi18nrc.yaml`, `.easyi18nrc.yml`, `.easyi18nrc.js`, `.easyi18nrc.ts`, `.easyi18nrc.mjs`, or `.easyi18nrc.cjs` file
4. `easyi18nrc`, `easyi18nrc.json`, `easyi18nrc.yaml`, `easyi18nrc.yml`, `easyi18nrc.js`, `easyi18nrc.ts`, `easyi18nrc.mjs`, or `easyi18nrc.cjs` file inside a `.config` subdirectory
5. `easyi18n.config.js`, `easyi18n.config.ts`, `easyi18n.config.mjs`, or `easyi18n.config.cjs` file

The configuration file should export an object with your desired options. For example:

## Roadmap

- [ ] Support both single file and directory formats as entry points
- [ ] Simplify configuration by automatically detecting entry format (file or directory)
- [ ] Add user-friendly CLI prompts for configuration setup
- [ ] Implement a `init` command to generate a default configuration file
- [ ] Provide clear documentation and examples for each configuration option
- [ ] Example project support for react-i18next
- [ ] Handle complex ICU patterns (e.g., plurals, selects) correctly during translation
- [ ] Implement JSON repair functionality for LLM translation output
- [ ] Improve error handling and reporting for translation process
- [ ] Add support for custom translation services beyond the default

## Local Development

1. Start the development server:
   ```
   turbo dev --filter=@easyi18n/cli
   ```

2. Start translation:
   ```
   cd packages/easy-i18n-cli
   node dist/cli.js -l all -f common
   ```