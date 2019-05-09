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
const depth_domain = {};

const requestCallBack = (resourceURI, index, dist, _protocol) => {
  const fileName = config.randomName ? `${index}-${path.basename(resourceURI)}` : config.filter(resourceURI);
  console.log(fileName);
  const callback = function(res) {
    console.log('request: ' + resourceURI + ' return status: ' + res.statusCode);
    const contentLength = parseInt(res.headers['content-length']);
    const fileBuff = [];
    res.on('data', function(chunk) {
      const buffer = new Buffer(chunk);
      fileBuff.push(buffer);
    });
    res.on('end', function() {
      console.log('end downloading ' + resourceURI);
      if (isNaN(contentLength)) {
        console.log(resourceURI + ' content length error');
        return;
      }
      const totalBuff = Buffer.concat(fileBuff);
      console.log('totalBuff.length = ' + totalBuff.length + ' ' + 'contentLength = ' + contentLength);
      if (totalBuff.length < contentLength) {
        console.log(resourceURI + ' download error, try again');
        downloadTask(resourceURI, index, dist, _protocol);
        return;
      }
      fs.appendFile(dist + '/' + fileName, totalBuff, function(err) {});
      counter.complete++;
      console.log('total ' + counter.total + ' complete ' + counter.complete);
    });
  };

  return callback;
};

const downloadTask = (resourceURI, index, dist, _protocol) => {
  console.log('start downloading ' + resourceURI);
  try {
    const req = protocol[_protocol || 'https'].request(resourceURI, requestCallBack(resourceURI, index, dist));
    req.on('error', function(e) {
      console.log('request ' + resourceURI + ' error, try again');
      downloadTask(resourceURI, index, dist, _protocol);
    });
    req.end();
  } catch (error) {
    console.log(_protocol, error);
    throw error;
  }
};

const requestRemote = (url, callback, _protocol) => {
  try {
    protocol[_protocol]
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
  } catch (err) {
    console.log(err, url);
  }
};

const readyDownloadTask = (srcAddrs, dist, _protocol) => {
  if (!srcAddrs) return;
  counter.total = srcAddrs.length;
  console.log('total ' + counter.total);
  srcAddrs.forEach(function(item, index, array) {
    downloadTask(item, index, dist, _protocol);
  });
};

const matchAddr = (content, _protocol) => {
  if (!content) return false;
  _protocol = _protocol || 'https:';
  try {
    const addrs = JSON.stringify(content).match(regular.img);
    if (!addrs) return false;
    return addrs.map((item, index, all) => {
      const result = regular.url.exec(item);
      if (result && !result[1]) {
        // 匹配到的资源不包含协议需要手动拼接
        return `${_protocol}${item}`;
      }
      return item;
    });
  } catch (error) {
    console.log('[matchAddr]', content, error);
  }
};

const mkdirFolder = dist => {
  try {
    if (!fs.existsSync(dist)) {
      let pathtmp;
      dist.split('/').forEach(dir => {
        if (pathtmp) {
          pathtmp = path.join(pathtmp, dir);
        } else {
          dir ? (pathtmp = dir) : (pathtmp = '/');
        }
        if (!fs.existsSync(pathtmp)) {
          if (!fs.mkdirSync(pathtmp)) {
            return false;
          }
        }
      });
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const start = (srcs, prevDist = '') => {
  if (!srcs || !srcs instanceof Array) return;
  srcs.forEach(src => {
    if (!src || !src.url || (src.enable != undefined && !src.enable)) return;
    let encode_url = encodeURIComponent(src.url);
    if (depth_domain[encode_url]) return;
    if (encode_url.length > 100) encode_url = encode_url.slice(0, 100);
    depth_domain[encode_url] = src;
    const currentDist = path.join(prevDist ? prevDist : config.distPath, encode_url);
    src.url = regular.process_url(src.url);
    if (mkdirFolder(currentDist)) {
      const url_array = regular.url.exec(src.url);
      const _protocol = url_array && url_array[2] ? url_array[2] : 'https';
      requestRemote(
        src.url,
        content => {
          if (content) {
            src.depth && depth.startDepth(content, --src.depth, currentDist, url_array);
            const srcAddrs = matchAddr(content, `${_protocol}:`);
            if (srcAddrs) {
              console.log(`${src.url} 中含有 所需资源 ${srcAddrs.length}`);
              readyDownloadTask(srcAddrs, currentDist, _protocol);
            }
          }
        },
        _protocol
      );
    } else {
      console.log('目录创建异常，请排查');
    }
  });
};

module.exports = {
  start
};
