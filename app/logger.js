class Logger {
  constructor(transports = []) {
    this._transports = transports;
  }

  success(message) {
    this._transports.forEach((t) => t.success(message));
  }

  info(message) {
    this._transports.forEach((t) => t.info(message));
  }

  warn(message) {
    this._transports.forEach((t) => t.warn(message));
  }

  error(message) {
    this._transports.forEach((t) => t.error(message));
  }
}

function createLogger(config, fsTransportFactory, consoleTransportFactory) {
  const transports = [consoleTransportFactory(config)];
  if (config.writeLogs) {
    transports.push(fsTransportFactory(config));
  }

  return new Logger(transports);
}

module.exports.Logger = Logger;
module.exports.createLogger = createLogger;
