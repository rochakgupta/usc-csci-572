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

const getSuggestions = async (query) => {
    let suggestions;
    const words = query.split(" ");
    if (words.length > 0) {
        const suggestionPrefix = words.slice(0, words.length - 1).join(" ");
        query = words[words.length - 1];
        const suggestions = await solr.suggest(query);
        suggestions.map((suggestion, index) => {
            suggestions[index] = `${suggestionPrefix} ${suggestion}`;
        });
        return suggestions;
    } else {
        suggestions = await solr.suggest(query);
    }
    return suggestions;
};

api.get("/suggest", async (req, res) => {
    let { query } = req.query;
    try {
        query = parser.parseQuery(query);
        const suggestions = await getSuggestions(query);
        res.json(suggestions);
    } catch (error) {
        const { statusCode, message } = error;
        res.status(statusCode).json({
            message
        });
    }
});

module.exports = api;
