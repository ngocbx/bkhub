var UserModel = require("../models/UserModel");
var Exception = require("../utils/ExceptionHandler");
var UserService = require("../services/UserService");
var PostService = require("../services/PostService");
var AuthentService = require("../services/AuthentService");
var image = require("../constant/image.js");
var TimeUtils = require("../utils/TimeUtils.js");
var jwt = require("jsonwebtoken");
var Constant = require("../utils/Constant");

module.exports.login = (req, res) => {

    try {
        var usernameOrEmailOrPhone = req.body.username;
        var password = req.body.password;

        if (!usernameOrEmailOrPhone || !password) {
            return Exception.badRequest(res, "Username or password must not be empty!")
        }

        // find by username
        UserModel.findOne({ username: usernameOrEmailOrPhone, password: password }, (err, user) => {
            if (err) {
                return Exception.internalServerError(res, err.message)
            } else if (user) {
                returnAuthenResponse(res, user);
            } else {

                // find by email
                UserModel.findOne({ email: usernameOrEmailOrPhone, password: password }, (err2, user2) => {
                    if (err2) {
                        return Exception.internalServerError(res, err2.message)
                    } else if (user2) {
                        returnAuthenResponse(res, user2);
                    } else {

                        // find by phone
                        UserModel.findOne({ phone: usernameOrEmailOrPhone, password: password }, (err3, user3) => {
                            if (err3) {
                                return Exception.internalServerError(res, err3.message)
                            } else if (user3) {
                                returnAuthenResponse(res, user3);
                            } else {
                                return Exception.badRequest(res, "Username or password is incorect!")
                            }
                        })
                    }
                })
            }
        })
    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
}

returnAuthenResponse = (res, user) => {
    jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
            user: user
        },
        Constant.TOKEN_SECRET_KEY,
        (err, token) => {
            if (err) {
                return Exception.internalServerError(res, "Đăng nhập thất bại!")
            } else {
                return res.status(200).json({
                    token: token,
                    user: {
                        userId: user.id,
                        username: user.username,
                        fullName: user.fullName,
                        avatarUrl: user.avatarUrl
                    }
                })
            }
        }
    )
}

module.exports.register = (req, res) => {

    try {
        var username = req.body.username;
        var password = req.body.password;
        var fullName = req.body.fullName;
        var address = req.body.address;
        var birthday = req.body.birthday;
        var phone = req.body.phone;
        var email = req.body.email;
        var avatarUrl = req.body.avatarUrl;

        if (!username || username.length <= 0 ||
            !password || password.length <= 0 ||
            !fullName || fullName.length <= 0 ||
            !phone || phone.length <= 0 ||
            !email || email.length <= 0) {
            return Exception.badRequest(res, "Username, password,email, phone, fullName must not be empty!")
        } else if (username.length < 6 || password.length < 6) {
            return Exception.badRequest(res, "Username or password must greater than 6 characters!")
        }

        if (!avatarUrl || avatarUrl.length == 0) {
            avatarUrl = randomeAvatar();
        }

        // find by username
        UserModel.findOne({ username: username }, (err, user) => {
            if (err) {
                Exception.internalServerError(res, err.message)
            } else if (user) {
                Exception.conflict(res, "Account already exists!")
            } else {

                // find by email
                UserModel.findOne({ email: email }, (err2, user2) => {
                    if (err2) {
                        Exception.internalServerError(res, err2.message)
                    } else if (user2) {
                        Exception.conflict(res, "Account already exists!")
                    } else {

                        // find by phone
                        UserModel.findOne({ phone: phone }, (err3, user3) => {
                            if (err3) {
                                Exception.internalServerError(res, err3.message)
                            } else if (user3) {
                                Exception.conflict(res, "Account already exists!")
                            } else {

                                // create user
                                var userModel = UserModel({
                                    username: username,
                                    password: password,
                                    phone: phone,
                                    email: email,
                                    fullName: fullName,
                                    avatarUrl: avatarUrl
                                })
                                if (address) userModel.address = address;
                                if (birthday && TimeUtils.isValidDate(birthday)) {
                                    userModel.birthday = TimeUtils.getFormatDate(birthday);
                                } else {
                                    userModel.birthday = TimeUtils.getTodayDate();
                                }

                                userModel.save((err4) => {
                                    if (err4) {
                                        Exception.internalServerError(res, err4.message)
                                    } else {
                                        returnAuthenResponse(res, userModel);
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
}

const randomeAvatar = () => {
    let avatars = image.AVATAR;
    let i = Math.round(Math.random() * (avatars.length - 1));
    return avatars[i];
}

module.exports.getUserByEmail = async (req, res) => {

    try {
        var token = req.headers.authorization;

        if (!token || token.length <= 0) {
            return Exception.unauthorized(res, "Token must not be empty!")
        }

        let googleUser = await AuthentService.getGoogleUser(token)
            .catch(() => {
                return undefined;
            });

        if (!googleUser || !googleUser.email) {
            return Exception.badRequest(res, "Token is invalid or expired!")
        }

        let email = googleUser.email;
        UserModel.findOne({ email: email }, (err, user) => {
            if (err) {
                Exception.internalServerError(res, err.message)
            } else if (user) {
                return res.status(200).json({
                    userId: user.id,
                    username: user.username,
                    fullName: user.fullName,
                    avatarUrl: user.avatarUrl
                })
            } else {
                Exception.notFound(res, "User does not exists!")
            }
        })
    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
}

module.exports.getUserByPhone = async (req, res) => {

    try {
        var token = req.headers.authorization;

        if (!token || token.length <= 0) {
            return Exception.unauthorized(res, "Token must not be empty!")
        }

        let facebookUser = await AuthentService.getFacebookPhone(token)
            .catch(() => {
                return undefined;
            });

        if (!facebookUser || !facebookUser.phone || !facebookUser.phone.national_number) {
            return Exception.badRequest(res, "Token is invalid or expired!")
        }

        let phone = "0" + facebookUser.phone.national_number;
        UserModel.findOne({ phone: phone }, (err, user) => {
            if (err) {
                Exception.internalServerError(res, err.message)
            } else if (user) {
                return res.status(200).json({
                    userId: user.id,
                    username: user.username,
                    fullName: user.fullName,
                    avatarUrl: user.avatarUrl
                })
            } else {
                Exception.notFound(res, "User does not exists!")
            }
        })
    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
}

module.exports.getAll = async (req, res) => {

    try {
        let user = req.user;

        UserModel.find({}, (err, list) => {
            if (err) {
                return Exception.internalServerError(res, err.message)
            } else {
                var responseList = [];
                for (var u of list) {
                    if (u.username != user.username) {
                        var resUser = {
                            userId: u.id,
                            username: u.username,
                            avatarUrl: u.avatarUrl,
                            fullName: u.fullName
                        }
                        responseList.push(resUser);
                    }
                }
                return res.status(200).json(responseList)
            }
        })

    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
}

module.exports.getDetail = async (req, res) => {
    try {

        var username = req.query.username;
        let user =
            await UserService.getUserByUsername(username)
                .catch(() => {
                    return undefined;
                });

        let postList =
            await PostService.getPostOfUser(user._id, user.username)
                .catch(() => {
                    return [];
                });

        var responseUser = {
            username: user.username,
            fullName: user.fullName,
            address: user.address,
            phone: user.phone,
            birthday: TimeUtils.getResponseDate(user.birthday),
            avatarUrl: user.avatarUrl,
            coverPhoto: user.coverPhoto,
            postList: postList
        };
        return res.status(200).json(responseUser)
    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
}

module.exports.updateAvatar = async (req, res) => {
    try {
        let userId = req.user._id;
        let avatarUrl = req.body.avatarUrl;

        let user =
            await UserService.getUser(userId)
                .catch(() => {
                    return undefined;
                });
        if (!user) {
            return Exception.badRequest(res, "Token is expire!");
        }

        user.avatarUrl = avatarUrl;

        user.save((err) => {
            if (err) {
                return Exception.internalServerError(res, error.message)
            } else {
                return res.status(200).json({ avatarUrl })
            }
        })

    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }

}

module.exports.updateCoverPhoto = async (req, res) => {
    try {
        var userId = req.user._id;
        var coverPhoto = req.body.coverPhoto;

        let user =
            await UserService.getUser(userId)
                .catch(() => {
                    return undefined;
                });
        if (!user) {
            return Exception.badRequest(res, "Token is expire!");
        }

        user.coverPhoto = coverPhoto;

        user.save((err) => {
            if (err) {
                return Exception.internalServerError(res, error.message)
            } else {
                return res.status(200).json({ coverPhoto })
            }
        })

    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }

}

module.exports.updateProfile = async (req, res) => {
    try {
        var userId = req.user._id;

        var fullName = req.body.fullName;
        var address = req.body.address;
        var birthday = req.body.birthday;
        var phone = req.body.phone;


        let user =
            await UserService.getUser(userId)
                .catch(() => {
                    return undefined;
                });
        if (!user) {
            return Exception.badRequest(res, "Token is expire!");
        }

        user.fullName = fullName;
        user.address = address;
        user.birthday = birthday;
        user.phone = phone;


        user.save((err) => {
            if (err) {
                return Exception.internalServerError(res, error.message)
            } else {
                return res.status(200).json({ user })
            }
        })

    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }

}