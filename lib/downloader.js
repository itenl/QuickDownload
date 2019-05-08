const config = require('../config');
const regular = require('./regular');
const depth = require('./depth');
const protocol = {
  http: require('http'),
  https: require('https')
};
const fs = require('fs');
const path = require('path');
const counter = {
  total: 0,
  complete: 0
};

const requestCallBack = (imgSrc, index, dist) => {
  const fileName = config.randomName ? `${index}-${path.basename(imgSrc)}` : config.filter(imgSrc);
  console.log(fileName);
  const callback = function(res) {
    console.log('request: ' + imgSrc + ' return status: ' + res.statusCode);
    const contentLength = parseInt(res.headers['content-length']);
    const fileBuff = [];
    res.on('data', function(chunk) {
      const buffer = new Buffer(chunk);
      fileBuff.push(buffer);
    });
    res.on('end', function() {
      console.log('end downloading ' + imgSrc);
      if (isNaN(contentLength)) {
        console.log(imgSrc + ' content length error');
        return;
      }
      const totalBuff = Buffer.concat(fileBuff);
      console.log('totalBuff.length = ' + totalBuff.length + ' ' + 'contentLength = ' + contentLength);
      if (totalBuff.length < contentLength) {
        console.log(imgSrc + ' download error, try again');
        downloadTask(imgSrc, index);
        return;
      }
      fs.appendFile(dist + '/' + fileName, totalBuff, function(err) {});
      counter.complete++;
      console.log('total ' + counter.total + ' complete ' + counter.complete);
    });
  };

  return callback;
};

const downloadTask = (imgSrc, index, dist) => {
  console.log('start downloading ' + imgSrc);
  const req = protocol[regular.url.exec(imgSrc)[2]].request(imgSrc, requestCallBack(imgSrc, index, dist));
  req.on('error', function(e) {
    console.log('request ' + imgSrc + ' error, try again');
    downloadTask(imgSrc, index, dist);
  });
  req.end();
};

const request = (url, callback) => {
  console.log(url);
  protocol[regular.url.exec(url)[2]]
    .get(url, function(res) {
      var chunks = [];
      var size = 0;
      res.on('data', function(chunk) {
        chunks.push(chunk);
        size += chunk.length;
      });
      res.on('end', function() {
        var data = Buffer.concat(chunks, size);
        var html = data.toString();
        callback && callback(html);
      });
    })
    .on('error', function(err) {
      console.log(err);
    });
};

const readyTask = (srcAddrs, dist) => {
  if (!srcAddrs) return;
  counter.total = srcAddrs.length;
  console.log('total ' + counter.total);
  srcAddrs.forEach(function(item, index, array) {
    downloadTask(item, index, dist);
  });
};

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


const start = srcs => {
  if (!srcs || !srcs instanceof Array) return;
  srcs.forEach(src => {
    if (!src || !src.url || (src.enable != undefined && !src.enable)) return;
    const dist = `${config.distPath}/${encodeURIComponent(src.url)}`;
    fs.mkdir(dist, result => {
      if (result) console.warn(result.code);
      request(src.url, content => {
        src.depth && depth.startDepth(content, --src.depth);
        const srcAddrs = matchAddr(content);
        readyTask(srcAddrs, dist);
      });
    });
  });
};

module.exports = {
  start
};
