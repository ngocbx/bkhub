const jwt = require("jsonwebtoken");
const Exception = require("./ExceptionHandler");
var UserModel = require("../models/UserModel");
var Constant = require("./Constant");

var verifyToken = (req, res, next) => {

    //Get auth header value
    const bearerHeader = req.headers["authorization"];

    if (bearerHeader !== undefined) {

        // get token from header
        const bearers = bearerHeader.split(" ");
        const bearerToken = bearers[1];

        // set token for req
        req.token = bearerToken;

        jwt.verify(bearerToken, Constant.TOKEN_SECRET_KEY, (err, data) => {
            if (err) {
                return Exception.unauthorized(res, "Invalid token!");
            } else {
                UserModel.findOne({ username: data.user.username }, (err, user) => {
                    if (err) return Exception.internalServerError(res, "authen fail")

                    if (!user) return Exception.unauthorized(res, "Invalid token!");
                    req.user = user;
                    next();
                })
            }
        })
    } else {
        Exception.unauthorized(res, "Invalid token!");
    }
}
module.exports = verifyToken;