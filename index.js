const downloader = require('./lib/downloader');
const regular = require('./lib/regular');
const resouce = require('./resouce');

const matchAddr = (content, protocol) => {
  if (!content) return;
  protocol = protocol || 'https:';
  return JSON.stringify(content)
    .match(regular.img)
    .map((item, index, all) => {
      const result = regular.url.exec(item);
      if (result && !result[1]) {
        return `${protocol}${item}`;
      }
      return item;
    });
};

resouce.girl.src.map(item => {
  downloader.request(item.url, html => {
    const list = matchAddr(html);
    downloader.start(list);
  });
});
