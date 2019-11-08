var GroupModel = require("../models/GroupModel");

module.exports.getGroup = (groupId) => {
    return new Promise((resolve, reject) => {
        GroupModel.findOne({ _id: groupId }, (err, group) => {
            if (!err) {
                return resolve(group);
            } else {
                return reject(err);
            }
        })
    })
}
