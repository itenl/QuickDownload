const config = require('../config');
module.exports = {
  url: /((\w+):)?\/\/([^\:|\/]+)(\:\d*)?(.*\/?)([^#|\?|\n]+)?(#.*)?(\?.*)?/i,
  userRequirement: (() => {
    console.log(config.mime.join('|'));
    // let reg = /((http:|https:)?\/\/)+(\w+\.)+(\w+)[\w\/\.\-]*(jpg|gif|png)/gi
    return new RegExp(`(http:\/\/|https:\/\/|\/\/)([\\w.]+\/?)\\S*\\.(${config.mime.join('|')})`, 'gi');
  })(),
  website: (content, distinct = true) => {
    let addrs = [];
    // 获取a标签href地址
    content.replace(/<a.*?href?\s*=\s*[\'|\"]+?(.*?)[\'|\"]+?/gi, (source, group, index) => {
      if (group) addrs.push(group);
      return source;
    });
    return distinct ? Array.from(new Set(addrs)) : addrs;
  },
  process_url: (url, protocol = 'https') => {
    return url.replace(/^\/\/.*?(.*)?/gi, (source, group, index) => {
      return `${protocol}://${group}`;
    });
  }
};
