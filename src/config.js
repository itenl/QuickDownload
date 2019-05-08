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
  // 正则匹配内容时忽略 http:或https:协议
  ignoreProtocol: true,
  // 文件名过滤规则
  filter: fileName => {
    // return fileName.replace(/(http|https):\/\/|\/|\?/g, '-');
    return encodeURIComponent(fileName);
  }
};
