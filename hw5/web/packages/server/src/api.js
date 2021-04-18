const express = require("express");
const solr = require("./solr");

const api = express.Router();

api.get("/search", async (req, res) => {
    const { query, type } = req.query;
    try {
        const data = await solr.search(query, type);
        res.json(data);
    } catch (error) {
        const { statusCode, message } = error;
        res.status(statusCode).json({
            message
        });
    }
});

module.exports = api;
