const isNonEmptyString = (value) => typeof value === "string" && value.length > 0;

const isNonEmptyStringArray = (value) =>
    Array.isArray(value) && value.length > 0 && value.every((entry) => isNonEmptyString(entry));

const isValue = (value) => isNonEmptyString(value) || isNonEmptyStringArray(value);

module.exports = {
    isNonEmptyString,
    isNonEmptyStringArray,
    isValue
};
