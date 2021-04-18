const solr = require("solr-client");
const parser = require("./parser");
const response = require("./response");

const buildData = async (object) => {
    const {
        response: { numFound: total, docs: documents }
    } = object;

    const start = Math.min(1, total);
    const end = Math.min(limit, total);

    for (let i = 0; i < documents.length; i++) {
        let document = documents[i];
        document = await parser.parseDocument(document);
        documents[i] = document;
    }

    return {
        start,
        end,
        total,
        documents
    };
};

let client = null;

const getClient = () => {
    if (!client) {
        client = solr.createClient({
            core: "myexample"
        });
    }
    return client;
};

const limit = 10;

const buildSolrQuery = (query, type, callback) => {
    let solrQuery;
    switch (type) {
        case "lucene":
            solrQuery = getClient().createQuery().q(query).start(0).rows(limit);
            break;
        case "pagerank":
            solrQuery = getClient().createQuery().q(query).sort({ pageRankFile: "desc" }).start(0).rows(limit);
            break;
        default:
            callback(new response.BadRequestError("Invalid query type"), null);
            return;
    }
    callback(null, solrQuery);
};

const runSolrQuery = (solrQuery, callback) => {
    getClient().search(solrQuery, async (error, object) => {
        if (error) {
            console.log(error);
            callback(new response.InternalServerError("Solr client errored"), null);
        } else {
            try {
                const data = await buildData(object);
                callback(null, data);
            } catch (error) {
                callback(error, null);
            }
        }
    });
};

const search = async (query, type, callback) => {
    buildSolrQuery(query, type, (error, solrQuery) => {
        if (error) {
            console.log(error);
            callback(error, null);
        } else {
            runSolrQuery(solrQuery, callback);
        }
    });
};

module.exports = {
    search
};
