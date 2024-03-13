import express from 'express';
import { Home, Board } from './index.js';

const app = express();
const port = 3000;
app.use(express.static('./'));

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"> 
      <title>SSR</title>
      <link type="text/css" rel="stylesheet" href="./index.css"></link>
      <script type="module" src="index.js"></script>
    </head>
    <body>
    <div id="root">
      ${Home()}
    </div>
    </body>
    </html>
  `);
});

app.get(/.*/, (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"> 
      <title>SSR</title>
      <link type="text/css" rel="stylesheet" href="./index.css"></link>
      <script type="module" src="index.js"></script>
    </head>
    <body>
    <div id="root">
      ${Board()}
    </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
    console.log(`SSR app listening on port ${port}`);
});
