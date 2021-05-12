const axios = require('axios');
const cheerio = require('cheerio');
const out = require('./output');

module.exports = class Crawler {
  constructor({ pathsWhitelist = [], pathsBlacklist = [], onFoundFile = () => {} }) {
    this.pathsBlacklist = pathsBlacklist;
    this.pathsWhitelist = pathsWhitelist;
    this.onFoundFile = onFoundFile;
  }

  async crawl(startUrl) {
    await this.nextLink(startUrl);
  }

  async nextLink(url) {
    const { headers } = await axios.head(url.toString());
    const isHtml = headers['content-type'].startsWith('text/html');
    const isCrawlAllowed = this.checkAllowedPath(url);
    if (!isCrawlAllowed) {
      return;
    }

    if (isHtml) {
      await this.nextDir(url).catch((err) => {
        out.error(`Resource loading ${url.toString()} was failed. ${err.toString()}`);
      });
    } else {
      await this.onFoundFile(url, parseInt(headers['content-length']));
    }
  }

  async nextDir(url) {
    const { data } = await axios.get(url.toString());
    const linksToVisit = this.collectLinks(data);
    for (const link of linksToVisit) {
      await this.nextLink(new URL(link, url));
    }
  }

  collectLinks(html) {
    const $ = cheerio.load(html);

    return $('pre a')
      .toArray()
      .map((node) => $(node).attr('href'))
      .filter((link) => !link.startsWith('..'));
  }

  checkAllowedPath(url) {
    if (this.pathsBlacklist.length > 0 && this.pathsBlacklist.includes(url.pathname)) {
      return false;
    }
    if (this.pathsWhitelist.length > 0) {
      return this.pathsWhitelist.includes(url.pathname);
    }
    return true;
  }
};
