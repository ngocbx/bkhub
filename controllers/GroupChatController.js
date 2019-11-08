var Exception = require("../utils/ExceptionHandler");
var UserService = require("../services/UserService");
var GroupService = require("../services/GroupService");
var GroupModel = require("../models/GroupModel");

module.exports.getAllGroup = async (req, res) => {
    try {
        let userId = req.user._id;

        GroupModel.find({ users: userId }, async (err, groups) => {
            if (err) {
                return Exception.internalServerError(res, err.message)
            } else if (!groups) {
                return Exception.notFound(res, "Not Found")
            } else {
                let groupList = [];
                for (let i = 0; i < groups.length; i++) {
                    let messages = groups[i].messages;
                    let lastMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : "";

                    let userIds = groups[i].users;
                    let users = await UserService.getUserList(userIds)
                        .catch(() => {
                            return undefined;
                        });
                    groupList.push({
                        groupId: groups[i].id,
                        groupName: groups[i].name,
                        lastMessage: lastMessage,
                        users: users
                    })
                }
                return res.status(200).json(groupList)
            }
        })
    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
}

module.exports.getAllMessage = async (req, res) => {
    try {
        let groupId = req.query.groupId;
        let userId = req.user._id;

        GroupModel.findOne({ _id: groupId }, async (err, group) => {
            if (err) {
                return Exception.internalServerError(res, err.message)
            } else if (!group) {
                return Exception.notFound(res, "Not Found")
            } else {
                let userIds = group.users;
                if (!userIds.includes(userId + "")) {
                    return Exception.forbidden(res, "Permisstion denied!")
                }
                let messages = group.messages;
                let users = await UserService.getUserList(userIds)
                    .catch(() => {
                        return undefined;
                    });
                let messageList = getMessage(messages, users);
                return res.status(200).json(messageList)
            }
        })

    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
}

const getMessage = (messages, users) => {
    let messageList = [];
    for (let i = 0; i < messages.length; i++) {
        for (let j = 0; j < users.length; j++) {
            if (messages[i].userId === users[j].userId) {
                messageList.push({
                    userId: users[j].userId,
                    fullName: users[j].fullName,
                    avatarUrl: users[j].avatarUrl,
                    content: messages[i].content
                })
                break;
            }
        }
    }
    return messageList;
}

module.exports.createGroup = (req, res) => {
    try {
        let users = req.body.users;

        GroupModel.findOne({ users: users }, (err, group) => {
            if (err) {
                return Exception.internalServerError(res, err.message)
            } else if (group) {
                return res.status(200).json(group)
            } else {
                var groupModel = GroupModel({
                    name: "",
                    users: users
                })
                groupModel.save((e, newGroup) => {
                    if (e) {
                        Exception.internalServerError(res, e.message)
                    } else {
                        return res.status(200).json(newGroup)
                    }
                })
            }
        })
    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
}

module.exports.updateGroupName = async (req, res) => {
    try {
        let userId = req.user._id;
        let groupId = req.body.groupId;
        let name = req.body.name;

        let group =
            await GroupService.getGroup(groupId)
                .catch(() => {
                    return undefined;
                });
        if (!group) {
            return Exception.badRequest(res, "GroupId is incorrect!");
        }

        if (!group.users.includes(userId + "")) {
            return Exception.forbidden(res, "Permisstion denied!")
        }

        group.name = name;

        group.save((err) => {
            if (err) {
                return Exception.internalServerError(res, error.message)
            } else {
                return res.status(200).json({ group })
            }
        })
    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
}