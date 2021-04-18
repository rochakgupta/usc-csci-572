const express = require('express');
const solr = require('./solr');

const api = express.Router();

api.get('/search', (req, res) => {
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

module.exports = api;