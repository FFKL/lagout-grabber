const out = require('./output');
const logger = require('./logger');
const { createCrawler } = require('./crawler');
const { createFileLoader } = require('./file-loader');
const argv = require('./args');

const fileLoader = createFileLoader(logger, out, argv);
const handlers = {
  onFoundFile: async (url, contentLength) => fileLoader.load(url, contentLength),
};
const crawler = createCrawler(out, argv, handlers);

crawler.crawl();
