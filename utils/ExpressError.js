// utils/ExpressError.js
class ExpressError extends Error {
    constructor(statusCode, message) {
        super(message);          // Pass message to built-in Error class
        this.statusCode = statusCode; // Capital C to match app.js usage
    }
}

module.exports = ExpressError;
