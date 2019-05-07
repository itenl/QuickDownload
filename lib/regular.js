const config = require('../config');
module.exports = {
  url: /((\w+):)?\/\/([^\:|\/]+)(\:\d*)?(.*\/)([^#|\?|\n]+)?(#.*)?(\?.*)?/i,
  img: (() => {
    console.log(config.mime.join('|'));
    // let reg = /((http:|https:)?\/\/)+(\w+\.)+(\w+)[\w\/\.\-]*(jpg|gif|png)/gi
    // let reg = /(\/\/)+(\w+\.)+(\w+)[\w\/\.\-]*(jpg|gif|png)/gi;
    return new RegExp(`(${config.ignoreProtocol ? '' : '(http:|https:)?'}\\/\\/)+(\\w+\\.)+(\\w+)[\\w\\/\\.\\-]*(${config.mime.join('|')})`, 'gi');
  })()
};
