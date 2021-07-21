var express = require('express');
var port = 3000;
var app = express();
var fs = require('fs');
var path = require('path');

var html = [];
html.push('<ul>');
fs.readdirSync(path.join(__dirname, 'examples')).forEach(function (file) {
    if (fs.statSync(path.join(__dirname, 'examples', file)).isDirectory()) {
        //app.use(rewrite('/' + file + '/*', '/' + file + '/index.html'))
        html.push(['<li><a href="examples/', file, '">', file, '</a></li>'].join(''));
    }
})
html.push('</ul>');
html = html.join('');

//fs.writeFile('index.html',html);

app.use(express.static(__dirname));


app.listen(port, function () {
    console.log('>app is running on port ' + port + '\n>type   http://127.0.0.1:' + port + '   in your browser to use the application\n>to stop the server: press  ctrl + c');
});

// var fetch = require('node-fetch');

// fetch('https://en.wikipedia.org/wiki/The_Championships,_Wimbledon/')
//     .then(function (res) {
//         return res.text();
//     }).then(function (body) {
//         console.log(body);
//     });