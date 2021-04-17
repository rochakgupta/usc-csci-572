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

class BadRequestError extends ResponseError {
    constructor(message) {
        super(statusCodes.BAD_REQUEST, message);
    }
}

class InternalServerError extends ResponseError {
    constructor(message) {
        super(statusCodes.INTERNAL_SERVER_ERROR, message);
    }
}

module.exports = {
    BadRequestError,
    InternalServerError
}