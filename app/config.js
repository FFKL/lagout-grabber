module.exports = {
  fileExtensionsWhitelist: [
    'pdf',
    'chm',
    'djvu',
    'txt',
    'jpg',
    'ppt',
    'pptx',
    'epub',
    'rtf',
    'doc',
    'docx',
  ],
  force: false,
  startFrom: '/',
  writeLogs: true,
  fileExtensionsBlacklist: [],
  pathsWhitelist: [],
  pathsBlacklist: [],
  logsDir: './logs/',
  outputDir: './content/',
  baseUrl: 'https://doc.lagout.org',
  linkSelector: 'pre a[href]',
};
