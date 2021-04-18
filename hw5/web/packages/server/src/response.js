const httpStatusCodes = require("http-status-codes");

class ResponseError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

const buildBadRequestError = (message) => {
    return buildError(httpStatusCodes.StatusCodes.BAD_REQUEST, message);
};

const buildInternalServerError = (message) => {
    return buildError(httpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR, message);
};

const buildError = (statusCode, message) => {
    if (!message) {
        message = httpStatusCodes.getStatusText(statusCode);
    }
    return new ResponseError(statusCode, message);
};

module.exports = {
    buildBadRequestError,
    buildInternalServerError,
    buildError
};
