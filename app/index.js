const out = require('./output');
const logger = require('./logger');

const Crawler = require('./crawler');
const { createFileLoader } = require('./file-loader');
const argv = require('./args');

const fileLoader = createFileLoader(logger, out, argv);
const crawler = new Crawler({
  onFoundFile: async (url, contentLength) => fileLoader.load(url, contentLength),
});

crawler.crawl(new URL(argv.baseUrl));
