const statusCodes = {
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500
}

class ResponseError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = {
    statusCodes,
    ResponseError
}