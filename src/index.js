const downloader = require('./lib/downloader');
const resource = require('./resource');

downloader.start(resource.api.src);
