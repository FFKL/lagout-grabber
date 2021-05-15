const axios = require('axios');
const fse = require('fs-extra');
const path = require('path');
const progress = require('progress-stream');
const cliProgress = require('cli-progress');

const { checkUrlExtension } = require('./utils');

class FileLoader {
  constructor(logger, config) {
    this._logger = logger;
    this._config = config;
  }

  async load(url, contentLength) {
    if (!this._checkAllowedFileType(url)) {
      this._logger.warn(`Skip: Resource loading is not allowed ${decodeURIComponent(url.pathname)}`);
      return;
    }
    const rootDir = path.resolve(process.cwd(), this._config.outputDir);
    const resultPath = path.join(rootDir, decodeURIComponent(url.pathname));
    await this._uploadFile(url, resultPath, contentLength);
  }

  async _uploadFile(url, filepath, contentLength) {
    const tempFilepath = `${filepath}.download`;
    if (!this._config.force && (await this._fileExists(filepath))) {
      this._logger.warn(`Skip: Resource already exists ${decodeURIComponent(url.pathname)}`);
      return;
    }

    return fse
      .ensureFile(tempFilepath)
      .then(() => axios.get(url.toString(), { responseType: 'stream' }))
      .then((file) => {
        this._logger.info(`Load resource from ${decodeURIComponent(url.pathname)}`);
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

  _fileExists(filepath) {
    return fse
      .access(filepath, fse.constants.F_OK)
      .then(() => true)
      .catch((err) => {
        if (err.code === 'ENOENT') {
          return false;
        }
        throw err;
      });
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

function createFileLoader(logger, config) {
  return new FileLoader(logger, config);
}

module.exports.createFileLoader = createFileLoader;
module.exports.FileLoader = FileLoader;
