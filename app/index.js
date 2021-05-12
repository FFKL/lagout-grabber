const axios = require('axios');
const cheerio = require('cheerio');
const fse = require('fs-extra');
const path = require('path');
const progress = require('progress-stream');
const cliProgress = require('cli-progress');
const out = require('output');

const host = 'doc.lagout.org';
const logfilePath = path.join(__dirname, 'skipped.log');
const whitelistExtensions = ['jpg', 'pdf', 'djvu', 'txt'];

async function loadFile(url, contentLength) {
  if (!whitelistExtensions.some((ext) => url.endsWith(`.${ext}`))) {
    await fse.appendFile(logfilePath, `'${decodeURIComponent(url)}'\n`);
    out.warn(`Skip resource from ${url}`);
    return;
  }
  out.info(`Load resource from ${url}`);
  const currPath = path.join(__dirname, 'result', decodeURIComponent(new URL(url).pathname));
  await fse.ensureFile(currPath);
  const writer = fse.createWriteStream(currPath);
  const file = await axios.get(url, { responseType: 'stream' });
  const prog = progress({
    length: contentLength,
    time: 100,
  });
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
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

async function grabFilenames(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const linksToVisit = $('pre a')
    .toArray()
    .map((node) => $(node).attr('href'))
    .filter((link) => !link.startsWith('..'));
  for (const link of linksToVisit) {
    await download(url, link);
  }
}

async function download(baseUrl, path) {
  const currentUrl = `${baseUrl}${path}`;
  await axios
    .head(currentUrl)
    .then(({ headers }) => {
      const isHtml = headers['content-type'].startsWith('text/html');
      return isHtml
        ? grabFilenames(currentUrl)
        : loadFile(currentUrl, parseInt(headers['content-length']));
    })
    .catch((err) => out.error(`Resource loading ${baseUrl}${path} was failed.`, err));
}

fse.ensureFile(logfilePath).then(() => download(`https://${host}/`, ''));
