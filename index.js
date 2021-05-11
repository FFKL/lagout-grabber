const axios = require('axios');
const cheerio = require('cheerio');
const fse = require('fs-extra');
const path = require('path');

const host = 'doc.lagout.org';

async function loadFile(url) {
  console.log('Loading....', url);
  const currPath = path.join(__dirname, 'result', new URL(url).pathname);
  await fse.ensureFile(currPath);
  const writer = await fse.createWriteStream(currPath);
  const file = await axios.get(url, { responseType: 'stream' });
  file.data.on('error', (error) => writer.close(error)).pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
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
  console.log(`Process ${currentUrl}`);
  await axios
    .head(currentUrl)
    .then(({ headers }) => headers['content-type'].startsWith('text/html'))
    .then((isHtml) => (isHtml ? grabFilenames(currentUrl) : loadFile(currentUrl)))
    .catch((err) => console.error(`Resource loading ${baseUrl}${path} was failed.`, err));
}

download(`https://${host}/`, '').then(() => 'Start loading...');
