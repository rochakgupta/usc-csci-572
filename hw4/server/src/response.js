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

class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = statusCodes.BAD_REQUEST;
    }
}

class InternalServerError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = statusCodes.INTERNAL_SERVER_ERROR;
    }
}

module.exports = {
    BadRequestError,
    InternalServerError
}