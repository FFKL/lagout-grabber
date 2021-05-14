const axios = require('axios');
const fse = require('fs-extra');
const path = require('path');
const progress = require('progress-stream');
const cliProgress = require('cli-progress');

const { checkUrlExtension } = require('./utils');

class FileLoader {
  constructor(logger, out, config) {
    this._logger = logger;
    this._out = out;
    this._config = config;
  }

  async load(url, contentLength) {
    if (!this._checkAllowedFileType(url)) {
      this._logger.resourceSkipped('NotWhitelistedExtension', decodeURIComponent(url.pathname));
      this._out.warn(`Skip resource from ${decodeURIComponent(url.pathname)}`);
      return;
    }
    this._out.info(`Load resource from ${decodeURIComponent(url.pathname)}`);
    const resultPath = path.join(process.cwd(), 'result', decodeURIComponent(url.pathname));
    await this._uploadFile(url, resultPath, contentLength);
  }

  _uploadFile(url, filepath, contentLength) {
    const tempFilepath = `${filepath}.download`;

    return fse
      .ensureFile(tempFilepath)
      .then(() => axios.get(url.toString(), { responseType: 'stream' }))
      .then((file) => {
        const bar = this._createProgressBar(contentLength);
        const writer = fse.createWriteStream(tempFilepath);
        file.data
          .on('error', (error) => writer.destroy(error))
          .pipe(progress({ length: contentLength, time: 100 }))
          .on('progress', ({ transferred }) => bar.update(transferred))
          .pipe(writer)
          .on('finish', () => bar.stop())
          .on('error', (err) => {
            bar.stop();
            file.destroy(err);
          });

        return new Promise((resolve, reject) => writer.on('finish', resolve).on('error', reject));
      })
      .then(() => fse.rename(tempFilepath, filepath));
  }

  _checkAllowedFileType(url) {
    const { fileExtensionsWhitelist: whitelist, fileExtensionsBlacklist: blacklist } = this._config;
    if (blacklist.length > 0 && blacklist.some((ext) => checkUrlExtension(url, ext))) {
      return false;
    }
    if (whitelist.length > 0) {
      return whitelist.some((ext) => checkUrlExtension(url, ext));
    }
    return true;
  }

  _createProgressBar(contentLength) {
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.legacy);
    bar.start(contentLength, 0);
    return bar;
  }
}

function createFileLoader(logger, out, config) {
  return new FileLoader(logger, out, config);
}

module.exports.createFileLoader = createFileLoader;
module.exports.FileLoader = FileLoader;
