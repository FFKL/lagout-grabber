const axios = require('axios');
const cheerio = require('cheerio');
const fse = require('fs-extra');
const path = require('path');
const progress = require('progress-stream');
const cliProgress = require('cli-progress');

const out = require('./output');
const logger = require('./logger');
const Crawler = require('./crawler');
const config = require('./config');
const { baseUrl } = require('./config');

async function loadFile(url, contentLength) {
  if (!config.fileExtensionsWhitelist.some((ext) => url.toString().endsWith(`.${ext}`))) {
    logger.resourceSkipped('NotWhitelistedExtension', decodeURIComponent(url.pathname));
    out.warn(`Skip resource from ${decodeURIComponent(url.pathname)}`);
    return;
  }
  out.info(`Load resource from ${decodeURIComponent(url.pathname)}`);
  const currPath = path.join(__dirname, 'result', decodeURIComponent(url.pathname));
  await fse.ensureFile(currPath);
  const writer = fse.createWriteStream(currPath);
  const file = await axios.get(url.toString(), { responseType: 'stream' });
  const prog = progress({
    length: contentLength,
    time: 100,
  });
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.legacy);
  bar.start(contentLength, 0);
  file.data
    .on('error', (error) => writer.destroy(error))
    .pipe(prog)
    .on('progress', ({ transferred }) => bar.update(transferred))
    .pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', () => {
      bar.stop();
      resolve();
    });
    writer.on('error', (err) => {
      file.destroy(err);
      bar.stop();
      reject(err);
    });
  });
}

const crawler = new Crawler({
  onFoundFile: async (url, contentLength) => loadFile(url, contentLength),
});

crawler.crawl(new URL(baseUrl));

// async function grabFilenames(url) {
//   const { data } = await axios.get(url);
//   const $ = cheerio.load(data);
//   const linksToVisit = $('pre a')
//     .toArray()
//     .map((node) => $(node).attr('href'))
//     .filter((link) => !link.startsWith('..'));
//   for (const link of linksToVisit) {
//     await download(url, link);
//   }
// }

// async function download(baseUrl, path) {
//   const currentUrl = `${baseUrl}${path}`;
//   await axios
//     .head(currentUrl)
//     .then(({ headers }) => {
//       const isHtml = headers['content-type'].startsWith('text/html');
//       return isHtml
//         ? grabFilenames(currentUrl)
//         : loadFile(currentUrl, parseInt(headers['content-length']));
//     })
//     .catch((err) => out.error(`Resource loading ${baseUrl}${path} was failed.`, err));
// }

// download(`https://${host}/`, '');
