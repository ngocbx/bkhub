module.exports.badRequest = (res, msg) => {
    res.status(400).json({
        err: msg
    });
};

module.exports.unauthorized = (res, msg) => {
    res.status(401).json({
        err: msg
    });
};

module.exports.forbidden = (res, msg) => {
    res.status(403).json({
        err: msg
    });
};

module.exports.notFound = (res, msg) => {
    res.status(404).json({
        err: msg
    });
};

module.exports.conflict = (res, msg) => {
    res.status(409).json({
        err: msg
    });
};

module.exports.internalServerError = (res, msg) => {
    res.status(500).json({
        err: msg ? msg : "Internal server error"
    });
};

module.exports.customeError = (statusCode, message) => {
    let error = new Error();
    error.status = statusCode;
    error.message = message;
    return error;
};