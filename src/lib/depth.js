const regular = require('./regular');

const processAddr = (url, sourceURL) => {
  url = regular.process_url(url);
  // if (true) { // A标签 存在相对路径的情况需要特殊处理  }
  return {
    url: url,
    enable: [
      () => {
        return !new RegExp(`.*?\\.(${['ico', 'css', 'js'].join('|')})$`, 'ig').test(url);
      },
      () => {
        return !!(url.indexOf(sourceURL.replace('www.', '')) > -1);
      },
      () => {
        return !!regular.url.test(url);
      }
    ].every(func => {
      return func && func();
    }),
    depth: 0
  };
};

const startDepth = (content, surplus, dist, _protocol) => {
  if (!_protocol || !_protocol[3]) {
    console.log('请提供源站地址，方可进行深度查询(避免内外联的深度广度过于宽泛)');
    return;
  }
  const addrs = regular.website(content);
  if (addrs) {
    const downloader = require('./downloader');
    console.log(`剩余深度 ${surplus} 已获取到 ${addrs.length} 个横向地址`);
    let items = [];
    addrs.forEach(url => {
      const item = processAddr(url, _protocol[3]);
      if (item.enable) items.push(item);
    });
    // items = items.slice(0, 100);
    downloader.start(items, dist);
  }
};

module.exports = {
  startDepth
};
