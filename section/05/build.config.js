const path = require('path');

module.exports = (mode = 'production') => ({
    mode,
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean: true,
    },
    template: './public/index.html',
    uglify: false,
    copy: {
        from: './public/styles',
        to: path.resolve(__dirname, 'dist', 'styles'),
    },
});
