const argument = process.argv[2];
const mode = argument?.split('=')[1]; // "NODE_ENV=development" -> ["NODE_ENV", "development"]
const config = require('./build.config.cjs')(mode);
const fs = require('fs');
const path = require('path');
const { minify_sync } = require('terser');

console.log({ config });

const indexHtml = fs
    .readFileSync(config.template)
    .toString()
    .replace('<!-- script -->', `<script type="module" src="${config.output.filename}"></script>`);

if (config.output.clean) {
    fs.rmSync(config.output.path, { force: true, recursive: true });
}

if (!fs.existsSync(config.output.path)) {
    fs.mkdirSync(config.output.path);
}

fs.writeFileSync(`${config.output.path}/index.html`, indexHtml);

const indexJs = fs.readFileSync(config.entry);
const bundleMap = minify_sync(indexJs.toString(), {
    mangle: config.uglify,
});

fs.writeFileSync(`${path.resolve(config.output.path, config.output.filename)}`, bundleMap.code);

if (config.copy) {
    fs.cpSync(config.copy.from, config.copy.to, { recursive: true });
}
