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
        .then(({ language, formatting }) => {
            if(formatting.toLowerCase() !== 'y' && formatting.toLowerCase() !== 'n'){
                console.log(`Please enter ${chalk.red('y or n')}`)
                process.exit(1);
            }

            const isFormatting = formatting.toLowerCase() === 'y'
            // package install
            install({ language, isFormatting });

            // TODO: 의존성 설치 - tsconfig.json, eslint, prettier
            setConfig({ language, isFormatting: formatting.toLowerCase() === 'y' })

            // package.json 스크립트 수정
            updatePackageJson();

            // setting Dirs
            makeDirectories();

            // setting Files
            makeFiles(language);

            console.log(chalk.blue('Enjoy your project !!'))
            process.exit(0);
        })
//     TODO: 작업중
//      https://github.dev/facebook/create-react-app/blob/main/packages/react-scripts/scripts/init.js
}

function makeDirectories() {
    fs.mkdirsSync('public')
    fs.mkdirsSync('src')
    fs.mkdirsSync('src/assets')
}

function install({ language, isFormatting }) {
    const { dependencies, devDependencies } = getDependencies({ language, isFormatting });

    shelljs.exec('npm init -y');
    console.log(chalk.yellow('Installing...'));
    shelljs.exec(`npm install ${dependencies.reduce((acc, cur) => `${acc} ${cur}`)}`);
    shelljs.exec('npm --save-dev install @typescript-eslint/parser@latest');
    shelljs.exec(`npm --save-dev install ${devDependencies.reduce((acc, cur) => `${acc} ${cur}`, '')}`);
}

function getDependencies({ language, isFormatting }) {
    const dependencies = ["react", "react-dom", "react-scripts"];
    const devDependencies = isFormatting ? ['prettier', 'eslint-config-prettier', 'eslint-plugin-prettier'] : [];

    if(language === 'TypeScript'){
        dependencies.push('typescript');
        devDependencies.push('@types/react', '@types/react-dom', '@typescript-eslint/parser', '@typescript-eslint/eslint-plugin')
    }

    return { dependencies, devDependencies }
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
    // const response = await fetch('https://registry.npmjs.org/-/package/create-my-custom-react/dist-tags')
    // if(response.status !== 200){
    //     throw new Error('api call error!')
    // }
    // const json = await response.json();
    // return json.latest;

    return '0.0.0'
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
        // yarn 사용 확인
        // if(hasYarn()){
        //     console.error(
        //         chalk.yellow(
        //             'Only Npm package manager is allowed.'
        //         )
        //     );
        //     process.exit(1);
        // }

    }
}

function setConfig({ language, isFormatting }) {
    if (language === 'TypeScript') {
        fs.writeJsonSync('tsconfig.json', getTsConfigTemplate(), { spaces: 2 });
    }

    if (isFormatting) {
        fs.writeJsonSync('.eslintrc', getEsLintTemplate(language), { spaces: 2 });
        fs.writeJsonSync('.prettierrc', getPrettierTemplate(), { spaces: 2 });
    }
}

function getTsConfigTemplate(){
    return {
        "compilerOptions": {
            "target": "es5",
            "lib": [
                "dom",
                "dom.iterable",
                "esnext"
            ],
            "allowJs": true,
            "skipLibCheck": true,
            "esModuleInterop": true,
            "allowSyntheticDefaultImports": true,
            "strict": true,
            "forceConsistentCasingInFileNames": true,
            "noFallthroughCasesInSwitch": true,
            "module": "esnext",
            "moduleResolution": "node",
            "resolveJsonModule": true,
            "isolatedModules": true,
            "noEmit": true,
            "jsx": "react-jsx"
        },
        "include": [
            "src"
        ]
    }
}

function getEsLintTemplate(language) {
    if (language === 'JavaScript') {
        return {
            "extends": ["react-app", "plugin:prettier/recommended"],
            "rules": {
                "rules": {
                    "prettier/prettier": "error",
                }
            }
        }
    }

    if (language === 'TypeScript') {
        return {
            "extends": ["react-app", "prettier"],
            "plugins": ["prettier", "@typescript-eslint"],
            "parser": "@typescript-eslint/parser",
            "parserOptions": {
                "project": "./tsconfig.json"
            },
            "rules": {
                "prettier/prettier": "error",
            }
        }
    }
}

function getPrettierTemplate() {
    return {
        "trailingComma": "es5",
        "tabWidth": 2,
        "semi": false,
        "singleQuote": true
    }
}

function makeFiles(language) {
    const { indexHtml, index, indexCss, App, AppCss } = getFilesTemplate();
    fs.writeFileSync('public/index.html', indexHtml);
    fs.writeFileSync('src/index.css', indexCss);
    fs.writeFileSync('src/App.css', AppCss);

    const extension = language === 'JavaScript' ? 'jsx' : 'tsx';
    fs.writeFileSync(`src/index.${extension}`, index);
    fs.writeFileSync(`src/App.${extension}`, App);
}

function getFilesTemplate(){
    const indexHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Web site created using create-react-app"
        />
        <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    
        <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
        <title>React App</title>
      </head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root"></div>
      </body>
    </html>
`;
    const index = `
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import './index.css';
    import App from './App';

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
`;
    const indexCss = `
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    code {
      font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
        monospace;
    }
`;
    const App = `
    import './App.css';

    function App() {
      return (
        <div className="App">
          <header className="App-header">
            <p>
              Edit <code>src/App.js</code> and save to reload.
            </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
          </header>
        </div>
      );
    }
    
    export default App;
`;

    const AppCss = `
    .App {
      text-align: center;
    }
    
    .App-logo {
      height: 40vmin;
      pointer-events: none;
    }
    
    @media (prefers-reduced-motion: no-preference) {
      .App-logo {
        animation: App-logo-spin infinite 20s linear;
      }
    }
    
    .App-header {
      background-color: #282c34;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: calc(10px + 2vmin);
      color: white;
    }
    
    .App-link {
      color: #61dafb;
    }
    
    @keyframes App-logo-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
`;

    return {
        indexHtml,
        index,
        indexCss,
        App,
        AppCss
    }
}
