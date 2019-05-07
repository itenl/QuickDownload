const downloader = require('./lib/downloader');
const resouce = require('./resouce');

downloader.start(resouce.api.src);
