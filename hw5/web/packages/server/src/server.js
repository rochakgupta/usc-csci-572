const express = require('express');
const cors = require('cors');
const expressWinston = require('express-winston');
const path = require('path');
const winston = require('winston');
const api = require('./api');

const app = express();

app.use(
    expressWinston.logger({
        transports: [new winston.transports.Console()],
        format: winston.format.combine(
            winston.format.json(),
            winston.format.prettyPrint()
        ),
        requestWhitelist: ['url', 'method', 'httpVersion', 'originalUrl', 'query'],
        responseWhitelist: ['statusCode'],
    })
);

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cors());

app.use(express.static(path.join(__dirname, '../../client/build')));

app.use('/api', api);

app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
