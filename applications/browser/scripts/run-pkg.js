const cp = require('child_process');
const fse = require('fs-extra');
const path = require('path');
const readline = require('readline');
const os = require('os');

// > Warning Cannot include file %1 into executable.
//   The file must be distributed with executable as %2.
//   %1: ..\node_modules\@theia\electron\node_modules\deep-defaults\lib\index.js
//   %2: path-to-executable/node_modules/deep-defaults/index.js

const dist = path.resolve('dist/win-x64');
fse.ensureDirSync(dist);

/* async */ fse.copy(path.join(__dirname, '../lib'), path.join(dist, 'lib'));
/* async */ fse.copy(path.join(__dirname, '../plugins'), path.join(dist, 'plugins'));

const toSkip = [
    /^path-to-executable\/electron\//
];

const commandLine = `npx pkg -t node12-win-x64 -o ${path.join(dist, 'theia-blueprint-node.exe')} src-gen/backend/main.js`;
console.log(`$ ${commandLine}`);
const pkg = cp.spawn(commandLine, {
    shell: true,
    windowsVerbatimArguments: true,
    cwd: path.resolve(__dirname, '..'),
    stdio: ['inherit', 'pipe', 'inherit']
});
/** @type {string | undefined} */
let fileToCopy = undefined;
const stdout = readline.createInterface(pkg.stdout);
stdout.on('line', line => {
    console.log(line);
    if (pkg.killed) {
        return;
    } else try {
        if (fileToCopy === undefined) {
            const exec1 = /\s+%1: (\S+)/.exec(line);
            const match1 = exec1 && exec1[1];
            if (match1) {
                const src = path.resolve(match1);
                if (fse.existsSync(src)) {
                    fileToCopy = src;
                } else {
                    console.log(`! ENOENT ${src}`);
                }
            }
        } else {
            const exec2 = /\s+%2: (\S+)/.exec(line);
            const match2 = exec2 && exec2[1];
            if (match2) {
                const dest = path.resolve(match2.replace(/^path-to-executable/, dist));
                if (toSkip.some(re => re.test(match2))) {
                    fileToCopy = undefined;
                    console.log(`! SKIP ${dest}`);
                } else {
                    fse.ensureDirSync(path.dirname(dest));
                    fse.copySync(fileToCopy, dest, { overwrite: true });
                    console.log(`! COPIED ${fileToCopy} TO ${dest}`);
                    fileToCopy = undefined;
                }
            }
        }
    } catch (error) {
        fileToCopy = undefined;
        console.error(error);
        pkg.kill(os.constants.signals.SIGKILL);
    }
});
