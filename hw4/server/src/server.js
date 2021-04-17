const express = require('express');
const expressWinston = require('express-winston');
const path = require('path');
const winston = require('winston');
const solr = require('./solr');

const app = express();

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
    const { query, type } = req.query;
    solr.search(query, type, (error, data) => {
        if (error) {
            const { statusCode, message } = error;
            res.status(statusCode).json({
                message
            })
        } else {
            res.json(data)
        }
    });
})

app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, './static/index.html'));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});