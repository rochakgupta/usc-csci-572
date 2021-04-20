const validator = require("./validator");
const mapping = require("./mapping");
const response = require("./response");

const defaultValue = "N/A";

const parseValue = (value) => {
    if (validator.isNonEmptyString(value)) {
        return value;
    }
    if (validator.isNonEmptyStringArray(value)) {
        return value[0];
    }
    return defaultValue;
};

const parseQuery = (query) => {
    if (!validator.isNonEmptyString(query)) {
        throw response.buildBadRequestError("Invalid query");
    }
    return query.toLowerCase();
};

const parseSearchType = (type) => {
    if (type !== "lucene" && type !== "pagerank") {
        throw response.buildBadRequestError("Invalid search type");
    }
    return type;
};

const parseDocument = async ({ id, og_description: description, og_url: url, title }) => {
    if (validator.isValue(id)) {
        id = parseValue(id);
        if (!validator.isValue(url)) {
            url = await mapping.getUrlByFilepath(id);
        }
        url = parseValue(url);
    } else {
        id = parseValue(id);
        url = parseValue(url);
    }
    description = parseValue(description);
    title = parseValue(title);
    return {
        id,
        url,
        description,
        title
    };
};

const parseSuggestion = ({ term }) => {
    return parseValue(term);
};

module.exports = {
    parseQuery,
    parseSearchType,
    parseDocument,
    parseSuggestion
};
