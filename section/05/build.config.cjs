const path = require('path');

module.exports = (mode = 'production') => ({
    mode,
    entry: './src/index.js',
    template: './public/index.html',
    output: {
        path: path.resolve(__dirname, 'dist'), // 빌드파일 경로
        filename: 'bundle.js', // 번들 파일명
        clean: true, // 내보내기 전에 output 디렉터리를 정리
    },
    uglify: false, // 난독화
    copy: {
        from: './public/styles',
        to: path.resolve(__dirname, 'dist', 'styles'),
    },
});
