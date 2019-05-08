const regular = require('./regular');

const processAddr = (url, sourceURL) => {
  url = regular.process_url(url);
  return {
    url: url,
    enable: !new RegExp(`.*?\\.(${['ico', 'css', 'js'].join('|')})$`, 'ig').test(url) && !!(url.indexOf(sourceURL.replace('www.', '')) > -1),
    depth: 0
  };
};

const startDepth = (content, surplus, dist, _protocol) => {
  if (!_protocol || !_protocol[3]) {
    console.log('请提供源站地址，方可进行深度查询(避免内外联的深度广度过于宽泛)');
    return;
  }
  let addrs = regular.website(content);
  if (addrs) {
    const downloader = require('./downloader');
    console.log(`剩余深度 ${surplus} 已获取到 ${addrs.length} 个横向地址`);
    addrs = addrs.map(url => {
      return processAddr(url, _protocol[3]);
    });
    // addrs = addrs.slice(0, 100);
    downloader.start(addrs, dist);
  }
};

module.exports = {
  startDepth
};
