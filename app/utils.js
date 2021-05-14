const path = require('path');

function checkUrlExtension(url, targetExt) {
  const { ext } = path.parse(url.pathname);

  return normalizeFileExt(ext) === normalizeFileExt(targetExt);
}

function normalizeFileExt(ext) {
  const leadingDot = ext.startsWith('.') ? '' : '.';
  return leadingDot + ext.toLowerCase();
}

module.exports.checkUrlExtension = checkUrlExtension;
module.exports.normalizeFileExt = normalizeFileExt;
