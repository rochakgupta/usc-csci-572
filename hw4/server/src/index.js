var express = require('express');
var expressWinston = require('express-winston');
var path = require('path');
var winston = require('winston');
var solr = require('./solr');

var app = express();

app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
    ),
    requestWhitelist: ['url', 'method', 'httpVersion', 'originalUrl', 'query'],
    responseWhitelist: ['statusCode']
}));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(express.static(path.join(__dirname, './static')));

app.get('/search', (req, res) => {
    var query = req.query;
    solr.search(query.query, query.type, function (error, data) {
        if (error) {
            res.status(error.statusCode).json({
                message: error.message
            })
        } else {
            res.json(data)
        }
    });
})

app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, './static/index.html'));
});

var PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});