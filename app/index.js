const out = require('./output');
const { createFSLogger } = require('./fs-logger');
const { createCrawler } = require('./crawler');
const { createFileLoader } = require('./file-loader');
const argv = require('./args');
const { createLogger } = require('./logger');

const logger = createLogger(
  argv,
  (c) => createFSLogger(c),
  () => out
);
const fileLoader = createFileLoader(logger, argv);
const handlers = {
  onFoundFile: async (url, contentLength) => fileLoader.load(url, contentLength),
};
const crawler = createCrawler(logger, argv, handlers);

crawler.crawl();
