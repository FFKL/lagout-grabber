const path = require('path');
const fse = require('fs-extra');

class FSLogger {
  constructor(config) {
    this._successFileStream = initLogFile(config.logsDir, 'success.log');
    this._infoFileStream = initLogFile(config.logsDir, 'info.log');
    this._warnFileStream = initLogFile(config.logsDir, 'warn.log');
    this._errorFileStream = initLogFile(config.logsDir, 'error.log');
  }

  success(message) {
    this._successFileStream.write(`${new Date().toISOString()} - ${message}\n`);
  }

  info(message) {
    this._infoFileStream.write(`${new Date().toISOString()} - ${message}\n`);
  }

  warn(message) {
    this._warnFileStream.write(`${new Date().toISOString()} - ${message}\n`);
  }

  error(message) {
    this._errorFileStream.write(`${new Date().toISOString()} - ${message}\n`);
  }

  end() {
    this._successFileStream.end();
    this._infoFileStream.end();
    this._warnFileStream.end();
    this._errorFileStream.end();
  }
}

function initLogFile(logsDir, filename) {
  const filePath = path.resolve(process.cwd(), logsDir, filename);
  fse.ensureFileSync(filePath);
  return fse.createWriteStream(filePath, { flags: 'a' });
}

function createFSLogger(config) {
  return new FSLogger(config);
}

module.exports.FSLogger = FSLogger;
module.exports.createFSLogger = createFSLogger;
