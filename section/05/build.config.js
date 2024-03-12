const path = require('path');

module.exports = (mode = 'production') => ({
    mode,
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    template: './public/index.html',
    uglify: true, // 난독화
    copy: {
        from: './public/styles',
        to: path.resolve(__dirname, 'dist', 'styles'),
    },
});
