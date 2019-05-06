const config = require('../config');
const protocol = {
  http: require('http'),
  https: require('https')
};
const regular = require('./regular');
const fs = require('fs');
const path = require('path');
const counter = {
  total: 0,
  complete: 0
};

const requestCallBack = (imgSrc, index) => {
  const fileName = config.isRandomFileName ? index + '-' + path.basename(imgSrc) : config.filter(imgSrc);
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
      fs.appendFile(config.distPath + '/' + fileName, totalBuff, function(err) {});
      counter.complete++;
      console.log('total ' + counter.total + ' complete ' + counter.complete);
    });
  };

  return callback;
};

const downloadTask = (imgSrc, index) => {
  console.log('start downloading ' + imgSrc);
  const req = protocol[regular.url.exec(imgSrc)[2]].request(imgSrc, requestCallBack(imgSrc, index));
  req.on('error', function(e) {
    console.log('request ' + imgSrc + ' error, try again');
    downloadTask(imgSrc, index);
  });
  req.end();
};

const request = (url, callback) => {
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

const start = list => {
  if (!list) return;
  counter.total = list.length;
  console.log('total ' + counter.total);
  fs.mkdir(config.distPath, result => {
    if (result) console.warn(result.code);
    list.forEach(function(item, index, array) {
      downloadTask(item, index);
    });
  });
};

module.exports = {
  start,
  request
};
