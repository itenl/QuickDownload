const regular = require('./regular');

// 处理所匹配到的地址
const processAddr = (url, _protocol) => {
  url = regular.process_url(url);
  if (true) {
    // A标签 存在相对路径的情况需要特殊处理  '/s02/index.html'
    url = url.replace(/^\/.*\.html?$/, (a, b, c) => {
      return `${_protocol[1]}//${_protocol[3]}${a}`;
    });
  }

  return {
    url: url,
    enable: [
      () => {
        // 过滤无意义的后缀资源链接（可修改成用户传入）
        return !new RegExp(`.*?\\.(${['ico', 'css', 'js'].join('|')})$`, 'ig').test(url);
      },
      () => {
        // 当前地址属于所传入的泛域下
        return !!(url.indexOf(_protocol[3].replace('www.', '')) > -1);
      },
      () => {
        // 属于合法域名
        return !!regular.url.test(url);
      }
    ].every(func => {
      return func && func();
    }),
    depth: 0
  };
};

// 匹配子页可访问的链接
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
      const item = processAddr(url, _protocol);
      if (item.enable) items.push(item);
    });
    downloader.start(items, dist);
  }
};

module.exports = {
  startDepth
};
