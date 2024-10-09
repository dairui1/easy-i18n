# @easyi18n/cli

## Usage

### Configuration

@easyi18n/cli uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for configuration file support. This means you can configure it in multiple ways:

1. `i18n` property in `package.json`
2. `.i18nrc` file in JSON or YAML format
3. `.i18nrc.json`, `.i18nrc.yaml`, `.i18nrc.yml`, `.i18nrc.js`, `.i18nrc.ts`, `.i18nrc.mjs`, or `.i18nrc.cjs` file
4. `i18nrc`, `i18nrc.json`, `i18nrc.yaml`, `i18nrc.yml`, `i18nrc.js`, `i18nrc.ts`, `i18nrc.mjs`, or `i18nrc.cjs` file inside a `.config` subdirectory
5. `i18n.config.js`, `i18n.config.ts`, `i18n.config.mjs`, or `i18n.config.cjs` file

The configuration file should export an object with your desired options. For example:


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