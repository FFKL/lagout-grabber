const path = require('path');
const config = require('./config');

function autoLoadConfigLookup() {
  try {
    return require(path.resolve(process.cwd(), 'grabber.config.json'));
  } catch (err) {
    return {};
  }
}

module.exports = require('yargs/yargs')(process.argv.slice(2))
  .alias('help', 'h')
  .alias('version', 'v')
  .boolean('force')
  .alias('force', 'f')
  .describe('force', 'Rewrite existing files')
  .string('root-pathname')
  .alias('root-pathname', 'r')
  .describe('root-pathname', 'Crawling from this pathname')
  .boolean('write-logs')
  .alias('write-logs', 'l')
  .describe('write-logs', 'Write logs to file system')
  .array('file-extensions-whitelist')
  .alias('file-extensions-whitelist', 'w')
  .describe('file-extensions-whitelist', 'List of allowed extensions')
  .array('file-extensions-blacklist')
  .alias('file-extensions-blacklist', 'b')
  .describe('file-extensions-blacklist', 'List of banned extensions')
  .array('paths-whitelist')
  .describe('paths-whitelist', 'List of allowed paths to crawl')
  .array('paths-blacklist')
  .describe('paths-blacklist', 'List of banned paths to crawl')
  .string('logs-dir')
  .describe('logs-dir', 'Output logs directory')
  .string('output-dir')
  .alias('output-dir', 'o')
  .describe('output-dir', 'Directory to uploading files')
  .string('base-url')
  .describe('base-url', 'Url to start crawling')
  .string('link-selector')
  .describe('link-selector', 'CSS selector for collecting links on a page')
  .default(config)
  .config(autoLoadConfigLookup()).argv;
