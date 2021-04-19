const validator = require("./validator");
const mapping = require("./mapping");

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
    parseDocument,
    parseSuggestion
};
