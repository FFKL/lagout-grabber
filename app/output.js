const chalk = require('chalk');
const log = console.log;

module.exports = {
  error(text) {
    log(chalk.red(text));
  },
  success(text) {
    log(chalk.green(text));
  },
  info(text) {
    log(chalk.cyan(text));
  },
  warn(text) {
    log(chalk.yellow(text));
  },
};
