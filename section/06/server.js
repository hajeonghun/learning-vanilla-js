import express from 'express';
import { addBoard, Board, boardList, Home, removeBoard } from './src/index.js';

const app = express();
const port = 3000;
app.use('/src', express.static('./src'));

function baseHtml(component, serverData = null) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>SSR</title>
        <link rel="stylesheet" href="src/index.css">
        <script type="module" src="src/index.js"></script>
        <script>
            window.__SSR_DATA__ = ${JSON.stringify(serverData)}        
        </script>
    </head>
    <body>
    <div id="root">${component()}</div>
    </body>
    </html>
    `;
}

app.post('/add/board', (req, res) => {
    addBoard();
    console.log('addBoard -', boardList);
    res.send();
});

app.delete('/delete/board', (req, res) => {
    removeBoard();
    console.log('removeBoard -', boardList);
    res.send();
});

app.get('/', (req, res) => {
    res.send(baseHtml(Home));
});

app.get('/board', (req, res) => {
    res.send(baseHtml(Board, { path: '/board', pageProps: { boardList } }));
});

app.listen(port, () => {
    console.log(`SSR app listening on port ${port}`);
});
