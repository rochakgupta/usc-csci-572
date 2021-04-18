const express = require("express");
const solr = require("./solr");

const api = express.Router();

api.get("/search", async (req, res) => {
    const { query, type } = req.query;
    try {
        const searchResult = await solr.search(query, type);
        res.json(searchResult);
    } catch (error) {
        const { statusCode, message } = error;
        res.status(statusCode).json({
            message
        });
    }
});

api.get("/suggest", async (req, res) => {
    const { query } = req.query;
    try {
        const suggestions = await solr.suggest(query);
        res.json(suggestions);
    } catch (error) {
        const { statusCode, message } = error;
        res.status(statusCode).json({
            message
        });
    }
});

module.exports = api;
