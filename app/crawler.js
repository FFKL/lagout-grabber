const axios = require('axios');
const cheerio = require('cheerio');

class Crawler {
  constructor(logger, config, handlers) {
    this._logger = logger;
    this._config = config;
    this._handlers = handlers;
  }

  async crawl() {
    await this._nextLink(new URL(this._config.rootPathname, this._config.baseUrl));
  }

  async _nextLink(url) {
    const { headers } = await axios.head(url.toString());
    const isHtml = headers['content-type'].startsWith('text/html');
    const isCrawlAllowed = this._checkAllowedPath(url);
    if (!isCrawlAllowed) {
      return;
    }

    if (isHtml) {
      await this._nextDir(url).catch((err) => {
        this._logger.error(`Resource loading ${url.toString()} was failed. ${err.toString()}`);
      });
    } else {
      await this._handlers.onFoundFile(url, parseInt(headers['content-length']));
    }
  }

  async _nextDir(url) {
    const { data } = await axios.get(url.toString());
    const linksToVisit = this._collectLinks(data);
    for (const link of linksToVisit) {
      await this._nextLink(new URL(link, url));
    }
  }

  _collectLinks(html) {
    const $ = cheerio.load(html);

    return $(this._config.linkSelector)
      .toArray()
      .map((node) => $(node).attr('href'))
      .filter((link) => !link.startsWith('..'));
  }

  _checkAllowedPath(url) {
    const { pathsBlacklist: blacklist, pathsWhitelist: whitelist } = this._config;
    if (blacklist.length > 0 && blacklist.includes(decodeURIComponent(url.pathname))) {
      return false;
    }
    if (whitelist.length > 0) {
      return whitelist.includes(decodeURIComponent(url.pathname));
    }
    return true;
  }
}

function createCrawler(logger, config, handlers) {
  return new Crawler(logger, config, handlers);
}

module.exports.Crawler = Crawler;
module.exports.createCrawler = createCrawler;
