var solr = require('solr-client');

var core = 'myexample';

var limit = 10;

var statusCodes = {
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500
}

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

var client = solr.createClient({
    core
});

function parseValue(value) {
    if (!value) {
        return 'N/A';
    }
    if (!Array.isArray(value)) {
        return value;
    }
    if (value.length === 0 || !value) {
        return 'N/A';
    }
    return value[0];
}

function buildData(object) {
    var response = object.response;

    var total = response.numFound;
    var start = Math.min(1, total);
    var end = Math.min(limit, total);

    var documents = [];
    response.docs.forEach(function (doc) {
        documents.push({
            id: parseValue(doc.id),
            description: parseValue(doc.description),
            url: parseValue(doc.og_url),
            title: parseValue(doc.title)
        })
    });

    return {
        start,
        end,
        total,
        documents
    }
}

function buildSolrQuery(query, type, callback) {
    var solrQuery;
    switch (type) {
        case 'lucene':
            solrQuery = client.createQuery()
                .q(query)
                .start(0)
                .rows(limit);
            break;
        case 'pagerank':
            solrQuery = client.createQuery()
                .q(query)
                .sort({ pageRankFile: 'desc' })
                .start(0)
                .rows(limit);
            break;
        default:
            callback(new HttpError(statusCodes.BAD_REQUEST, 'Invalid query type'), null);
            return;
    }
    callback(null, solrQuery);
}

function runSolrQuery(solrQuery, callback) {
    client.search(solrQuery, function (error, object) {
        if (error) {
            console.log(error);
            callback(new HttpError(statusCodes.INTERNAL_SERVER_ERROR, 'Solr client errored'), null);
        } else {
            var data = buildData(object);
            callback(null, data);
        }
    });
}

function search(query, type, callback) {
    buildSolrQuery(query, type, function (error, solrQuery) {
        if (error) {
            console.log(error);
            callback(error, null);
        } else {
            runSolrQuery(solrQuery, callback);
        }
    });
}

module.exports = {
    search
};