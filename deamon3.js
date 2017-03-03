// 和server3.js配合使用，是其守护进程

var cp = require('child_process');

var worker;

function spawn(server, config) {
    worker = cp.spawn('node', [server, config]);
    worker.on('exit', (code) => {
        console.log("code: " + code)
        if (code != 0) {
            console.log('自动重启');
            spawn(server, config);
        }
    });
}

function main(argv) {
    spawn('server3.js', argv[0]);

    process.on('SIGTERM', () => {
        worker.kill();
        process.exit(0);
    });
}

main(process.argv.slice(2));
