#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk'
import envinfo from 'envinfo' // PC 정보
import packageJson from './package.json' assert { type: 'json' };
import semver from 'semver';
import fs from 'fs-extra'
import inquirer from 'inquirer';
import shelljs from 'shelljs';

// ES 모듈에서 __filename, __dirname 사용하기 위한 방법
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
let projectName;

export async function init(){
    const program = new Command(packageJson.name)
        .version(packageJson.version, '-v, --version')
        .arguments('[project-directory]')
        .usage(`${chalk.green('<project-directory>')} [options]`)
        .option('--info', 'print environment debug info')
        .action((name) => {
            console.log({name})
            projectName = name;
        })
        .addHelpText('after', addHelpText())

    program.parse()

    // options 객체
    const options = program.opts();
    console.log({options})
    if (options.info) {
        console.log(chalk.bold('\nEnvironment Info:'));
        console.log(
            `\n  current version of ${packageJson.name}: ${packageJson.version}`
        );
        console.log(`  running from ${__dirname}`);

        return envinfo.run(
            {
                System: ['OS', 'CPU'],
                Binaries: ['Node', 'npm', 'Yarn'],
                Browsers: [
                    'Chrome',
                    'Edge',
                    'Internet Explorer',
                    'Firefox',
                    'Safari',
                ],
                npmPackages: ['react', 'react-dom', 'react-scripts'],
                npmGlobalPackages: ['create-react-app'],
            },
            {
                duplicates: true,
                showNotFound: true,
            }
        )
            .then(console.log);
    }

    if (typeof projectName === 'undefined') {
        console.error('Please specify the project directory:');
        console.log(
            `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
        );
        console.log();
        console.log('For example:');
        console.log(
            `  ${chalk.cyan(program.name())} ${chalk.green('my-react-app')}`
        );
        console.log();
        console.log(
            `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
        );
        process.exit(1);
    }

    // 최신버전 CRA 확인 (semver 설치)
    await checkVersion();

    // root 폴더 생성
    await mkdirRootDir(projectName);

    // interactive CLI 제공 (inquirer 설치)
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'language',
                message:'Select the language',
                choices: ['JavaScript', 'TypeScript']
            },
            {
                type: 'input',
                name: 'formatting',
                message:'Does your project use Eslint+Prettier? (y/n)',
            }
        ])
        .then(({language, formatting}) => {
            if(formatting.toLowerCase() !== 'y' && formatting.toLowerCase() !== 'n'){
                console.log(`Please enter ${chalk.red('y or n')}`)
                process.exit(1);
            }

            console.log({language, formatting})
            const dependencies = ["react", "react-dom", "react-scripts"];


            shelljs.exec('npm init -y');
            console.log(chalk.yellow('Installing...'));
            shelljs.exec(`npm install ${dependencies.reduce((acc, cur) => `${acc} ${cur}`)}`)
            // TODO: 타입스크립트, eslint, prettier

            // package.json 스크립트 수정
            updatePackageJson();

            // 디렉토링
            fs.mkdirsSync('src')
            fs.mkdirsSync('src/components')
            fs.mkdirsSync('src/pages')
            fs.mkdirsSync('src/assets')

            process.exit(0);
        })
//     TODO: 작업중
//      https://github.dev/facebook/create-react-app/blob/main/packages/react-scripts/scripts/init.js
}


function mkdirRootDir(projectName) {
    const projectPath = path.join(process.cwd(), projectName);
    console.log('projectPath:',projectName, projectPath)
    if (fs.pathExistsSync(projectPath)){
        console.log(`The ${chalk.red(projectName)} Project already exist in the current directory.`)
        process.exit(1);
    }

    console.log('이동 전 process.cwd()',process.cwd())
    fs.mkdirsSync(projectPath); // root 폴더 생성
    process.chdir(projectPath); // 현재 작업경로 이동
    console.log('이동 후 process.cwd()',process.cwd())
}


function addHelpText() {
    return `
        Only ${chalk.green('<project-directory>')} is required.
    
        A custom ${chalk.cyan('--scripts-version')} can be one of:
          - a specific npm version: ${chalk.green('0.8.2')}
          - a specific npm tag: ${chalk.green('@next')}
          - a custom fork published on npm: ${chalk.green(
        'my-react-scripts'
    )}
          - a local path relative to the current working directory: ${chalk.green(
        'file:../my-react-scripts'
    )}
          - a .tgz archive: ${chalk.green(
        'https://mysite.com/my-react-scripts-0.8.2.tgz'
    )}
          - a .tar.gz archive: ${chalk.green(
        'https://mysite.com/my-react-scripts-0.8.2.tar.gz'
    )}
    `
}
function updatePackageJson() {
    console.log('packagejson cwd:', process.cwd());
    const packageObj = fs.readJsonSync('package.json')
    const newPackageObj = {
        ...packageObj,
        "scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test",
            "eject": "react-scripts eject"
        },
        "eslintConfig": {
            "extends": [
                "react-app",
            ]
        },
        "browserslist": {
            "production": [
                ">0.2%",
                "not dead",
                "not op_mini all"
            ],
            "development": [
                "last 1 chrome version",
                "last 1 firefox version",
                "last 1 safari version"
            ]
        }
    };


    // fs.writeJsonSync('package.json', newPackageObj) // NOTE: 한줄로 되는거 표시
    fs.writeJsonSync('package.json', newPackageObj, { spaces: 2 });
}

async function checkForLatestVersion() {
    // FIXME: npm 배포하면 패키지 주소 변경
    const response = await fetch('https://registry.npmjs.org/-/package/create-my-custom-react/dist-tags')
    if(response.status !== 200){
        throw new Error('api call error!')
    }
    const json = await response.json();
    return json.latest;
}

function hasYarn(cwd = process.cwd()) {
    // cwd(Current working Directory)
    // or "process.env.npm_config_user_agent" => 패키지 사용에 따라 맨앞에 yarn 혹은 npm 위치
    // return fs.pathExistsSync(path.resolve(cwd, 'yarn.lock'));
    return (process.env.npm_config_user_agent || '').indexOf('yarn') === 0;
}

async function checkVersion() {

    const latestVersion = await checkForLatestVersion();
    console.log({latestVersion})
    if (semver.lt(packageJson.version,latestVersion)) {
        console.log();
        console.error(
            chalk.yellow(
                `You are running \`create-react-app\` ${packageJson.version}, which is behind the latest release (${latestVersion}).\n\n` +
                'We recommend always using the latest version of create-react-app if possible.'
            )
        );
        console.log();
        console.log(
            'The latest instructions for creating a new app can be found here:\n' +
            'https://create-react-app.dev/docs/getting-started/'
        );
        console.log();
        process.exit(1);
    } else{
        // yarn 사용만 허용
        if(!hasYarn()){
            console.error(
                chalk.yellow(
                    'Only Yarn package manager is allowed.'
                )
            );
            process.exit(1);
        }

        console.log('!!')
    }
}
