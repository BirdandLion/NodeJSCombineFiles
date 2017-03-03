var fs = require('fs'),
    path = require('path'),
    http = require('http');

var MIME = {
    '.css': 'text/css',
    '.js': 'application/javascript'
};

// 合并文件内容
function combineFiles(pathnames, callback) {
    var output = [];

    (function next(i, len) {
        if (i < len) {
            fs.readFile(pathnames[i], function (err, data) {
                if (err) {
                    callback(err);
                } else {
                    output.push(data);
                    next(i + 1, len);
                }
            });
        } else {
            const data = Buffer.concat(output);
            console.log(data);
            
            callback(null, data);
        }
    }(0, pathnames.length));
}

function main(argv) {
    // 从文件读取配置参数
    // var config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
    //     root = config.root || '.',
    //     port = config.port || 80;

    // 直接给定配置参数
    var root = __dirname;
    var port = 8300;

    http.createServer(function (request, response) {
         var urlInfo = parseURL(root, request.url);

         console.log(urlInfo);

         combineFiles(urlInfo.pathnames, function (err, data) {
             if (err) {
                 response.writeHead(404);
                 response.end(err.message);
             } else {
                 response.writeHead(200, {
                     'Content-Type': urlInfo.mime
                 });

                 response.end(data);
             }
         });
    }).listen(port);
}

// 解析文件路径
function parseURL (root, url) {
    var base, pathnames, parts;

    if (url.indexOf('??') === -1) {
        url = url.replace('/', '/??');
    }

    parts = url.split('??');
    base = parts[0];
    pathnames = parts[1].split(',').map(function(value) {
        var filePath = path.join(root, base, value);
        return filePath;
    });

    return {
        mime: MIME[path.extname(pathnames[0])] || 'text/plain',
        pathnames: pathnames
    };
}

main(process.argv.slice(2));

/*
测试URL: 127.0.0.1:8300/??a.js,b.js
输出：
    hello
    kelvin
    world
 */
