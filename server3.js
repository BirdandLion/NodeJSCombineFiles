var fs = require('fs'),
    path = require('path'),
    http = require('http');

var MIME = {
    '.css': 'text/css',
    '.js': 'application/javascript'
};

function main(argv) {
    var root = __dirname;
    var port = 8420;
    var server;

    server = http.createServer((request, response) => {
        var urlInfo = parseURL(root, request.url);
        
        validateFiles(urlInfo.pathnames, (err, pathnames) => {
            if (err) {
                response.writeHead(404);
                response.end(err.message);
            } else {
                response.writeHead(200, {
                    'Content-Type': urlInfo.mime
                });

                outputFiles(pathnames, response);

                setTimeout(function() {
                    process.kill(process.pid, 'SIGTERM');
                }, 3000);
            }
        })
    }).listen(port);

    process.on('SIGTERM', () => {
        server.close(() => {
            console.log('server closed');
            process.exit(0);
        });
    });
}

function outputFiles(pathnames, writer) {
    (function next(i, len) {
        if (i <len) {
            var reader = fs.createReadStream(pathnames[i]);

            reader.pipe(writer, {end: false});
            reader.on('end', function() {
                next(i + 1, len);
            })
        } else {
            writer.end();
        }
    }(0, pathnames.length));
}

function validateFiles(pathnames, callback) {
    (function next(i, len) {
        if (i < len) {
            fs.stat(pathnames[i], (err, stats) => {
                if (err) {
                    callback(err);
                } else if (!stats.isFile()){
                    callback(new Error());
                } else {
                    next(i + 1, len);
                }
            });
        } else {
            callback(null, pathnames);
        }
    }(0, pathnames.length));
}

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

main();

/*
测试URL: 127.0.0.1:8300/??a.js,b.js
输出：
    hello
    kelvin
    world
 */
