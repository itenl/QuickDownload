module.exports = {
  // 是否随机文件名
  randomName: false,
  // 输出路径
  distPath: './dist',
  // 自动子路径
  // depth > 0
  autoChildPath: true,
  // 允许下载文件后缀
  mime: ['jpg', 'gif', 'png'],
  // socks5 Proxy
  shttp: {
    socksHost: '127.0.0.1',
    socksHost: '1086'
  },
  // 正则匹配内容时忽略 http:或https:协议 已强制忽略
  // ignoreProtocol: true,
  // 文件名过滤规则
  filter: fileName => {
    return encodeURIComponent(fileName);
  }
};
