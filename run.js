import { spawn } from 'child_process';
import { exec as _exec } from 'child_process';
import { promisify } from 'util';

const exec = promisify(_exec).bind(null);

function start(cmd) {
    return spawn(cmd, [], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });
}

start('clear');

// start('screenfetch');

start('bash');

console.log('terminal ready to use!');