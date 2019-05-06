module.exports = {
  // 是否随机文件名
  isRandomFileName: false,
  // 输出路径
  distPath: './dist',
  // 文件名过滤规则
  filter: fileName => {
    return fileName.replace(/(http|https):\/\/|\/|\?/g, '-');
  }
};
