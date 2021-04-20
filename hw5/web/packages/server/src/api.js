const express = require("express");
const solr = require("./solr");
const parser = require("./parser");

const api = express.Router();

api.get("/search", async (req, res) => {
    let { query, type } = req.query;
    try {
        query = parser.parseQuery(query);
        type = parser.parseSearchType(type);
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
    let { query } = req.query;
    try {
        query = parser.parseQuery(query);
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
