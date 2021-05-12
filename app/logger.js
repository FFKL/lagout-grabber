const path = require('path');
const fse = require('fs-extra');
const config = require('./config');

const skippedStream = initLogFile('skipped.log');
const errorStream = initLogFile('error.log');

module.exports = {
  resourceSkipped(reason, message) {
    skippedStream.write(`${new Date().toISOString()} - ${reason} - ${message}\n`);
  },
  error(message) {
    errorStream.write(`${new Date().toISOString()} - ${message}\n`);
  },
  end() {
    skippedStream.end();
    errorStream.end();
  },
};

function initLogFile(filename) {
  const filePath = path.resolve(__dirname, config.logsDir, filename);
  fse.ensureFileSync(filePath);
  return fse.createWriteStream(filePath, { flags: 'a' });
}
