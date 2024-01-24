const http = require('node:http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    if (/^\/about\/?$/.test(reqUrl.pathname)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`Hello About! - ${reqUrl.href}`);
    } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end('<html><head></head><body><h1>Hello World!!!</h1></body></html>');
    }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});