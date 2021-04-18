const axios = require("axios");
const response = require("./response");
const parser = require("./parser");

let instance = null;

const getInstance = () => {
    if (!instance) {
        instance = axios.create({
            baseURL: "http://localhost:8983/solr/myexample", // package.json specifies the proxy to the server
            headers: {
                "Content-Type": "application/json"
            },
            paramsSerializer: (object) => {
                let array = [];
                for (const [key, value] of Object.entries(object)) {
                    array.push(`${key}=${encodeURIComponent(value)}`);
                }
                return array.join("&");
            }
        });
        instance.interceptors.request.use(
            (config) => {
                console.info(`Solr Request: ${axios.getUri(config)}`);
                return config;
            },
            (error) => {
                console.info(`Solr Request: ${error}`);
                return Promise.reject(error);
            }
        );
        // instance.interceptors.response.use(
        //     (response) => {
        //         console.info(`Solr Response: ${JSON.stringify(response.data, undefined, 2)}`);
        //         return response;
        //     },
        //     (error) => {
        //         console.info(`Solr Response: ${error}`);
        //         return Promise.reject(error);
        //     }
        // );
    }
    return instance;
};

const limit = 10;

const buildSearchData = async (data) => {
    const {
        response: { numFound: total, docs }
    } = data;

    const start = Math.min(1, total);
    const end = Math.min(limit, total);

    const documents = [];
    for (let doc of docs) {
        document = await parser.parseDocument(doc);
        documents.push(document);
    }

    return {
        start,
        end,
        total,
        documents
    };
};

const buildError = (error) => {
    if (error.response) {
        return response.buildError(error.response.status);
    } else {
        return response.buildInternalServerError("Client or network errored");
    }
};

const search = async (query, type) => {
    if (type !== "lucene" && type !== "pagerank") {
        throw response.buildBadRequestError("Invalid query type");
    }
    try {
        const response = await getInstance().get("/select", {
            params: {
                q: query,
                rows: limit,
                fl: "id,og_url,og_description,title",
                ...(type === "pagerank" && {
                    sort: "pageRankFile desc"
                })
            }
        });
        const data = await buildSearchData(response.data);
        return data;
    } catch (error) {
        console.log(error);
        throw buildError(error);
    }
};

module.exports = {
    search
};
