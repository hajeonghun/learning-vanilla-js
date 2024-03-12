const argument = process.argv[2]; // 'NODE_ENV=development'
const mode = argument?.split('=')[1]; // ['NODE_ENV', 'development']
const config = require('./build.config.js')(mode);
const fs = require('fs');
const { minify_sync } = require('terser');

console.log({ config });

if (config.output.clean) {
    // rm -rf
    fs.rmSync(config.output.path, { force: true, recursive: true });
}

const indexHtml = fs
    .readFileSync(config.template)
    .toString()
    .replace('<!--  script  -->', `<script type="module" src="${config.output.filename}"></script>`);

if (!fs.existsSync(config.output.path)) {
    fs.mkdirSync(config.output.path);
}

fs.writeFileSync(`${config.output.path}/index.html`, indexHtml);

const indexJs = fs.readFileSync(config.entry).toString();
const bundleMap = minify_sync(indexJs, {
    mangle: config.uglify,
});
console.log({ bundleMap });

fs.writeFileSync(`${config.output.path}/${config.output.filename}`, bundleMap.code);

if (config.copy) {
    fs.cpSync(config.copy.from, config.copy.to, { recursive: true });
}
