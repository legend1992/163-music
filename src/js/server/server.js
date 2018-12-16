const http = require('http')
const port = process.argv[2]
const fs = require('fs')
const qiniu = require('qiniu')

if (!port) {
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}
let server = http.createServer(function (request, response) {
  let path = request.url
  if (path.indexOf('?') >= 0) { query = path.substring(path.indexOf('?')) }
  /******** 从这里开始看，上面不要看 ************/
  console.log('HTTP 路径为\n' + path)
  if (path === '/api/uptoken') {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Content-Type', 'text/css; charset=utf-8');
    let { accessKey, secretKey } = JSON.parse(fs.readFileSync('./aksk.json'));
    console.log(accessKey, secretKey)
    let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    let options = {
      scope: '163-music',
      expires: 7200
    };
    let putPolicy = new qiniu.rs.PutPolicy(options);
    let uploadToken = putPolicy.uploadToken(mac);
    response.write(`{"token": "${uploadToken}"}`);
    response.end()
  } else {
    response.statusCode = 404
    response.end()
  }
  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)
