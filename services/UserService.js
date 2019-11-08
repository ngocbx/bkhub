var UserModel = require("../models/UserModel");

module.exports.getUser = (userId) => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ _id: userId }, (err, user) => {
            if (!err) {
                return resolve(user);
            } else {
                return reject(err);
            }
        })
    })
}

module.exports.getUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ username: username }, (err, user) => {
            if (!err) {
                return resolve(user);
            } else {
                return reject(err);
            }
        })
    })
}

module.exports.getUserList = (userIds) => {
    return new Promise((resolve, reject) => {
        UserModel.find({ _id: { $in: userIds } }, (err, users) => {
            if (!err) {
                let list = [];
                if (!users) return resolve(list);
                for (let i = 0; i < users.length; i++) {
                    list.push({
                        userId: users[i].id,
                        fullName: users[i].fullName,
                        avatarUrl: users[i].avatarUrl
                    })
                }
                return resolve(list);
            } else {
                return reject(err);
            }
        })
    })
}