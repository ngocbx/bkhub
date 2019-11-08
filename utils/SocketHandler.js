const ChatRoom = require("./ChatRoom");
const GroupService = require("../services/GroupService");
var UserService = require("../services/UserService");

module.exports.connect = (server) => {

    try {
        var io = require("socket.io").listen(server);

        io.on('connection', (socket) => {
            console.log("connection : " + socket.id);

            socket.on('join_chat', function (groupId, userId) {
                ChatRoom.joinRoom(groupId, userId, socket.id);
            })

            socket.on('create_messge', async (groupId, userId, content) => {

                let user = await UserService.getUser(userId)
                    .catch(() => {
                        return undefined;
                    });
                if (!user) return


                let message = { "userId": userId, "content": content }

                let group = await GroupService.getGroup(groupId)
                    .catch(() => {
                        return undefined;
                    });

                if (group) {
                    let userIds = group.users;
                    if (userIds.indexOf(userId) < 0) {
                        group.users.push(userId);
                    }
                    group.messages.push(message)
                }

                group.save((err) => {
                    if (!err) {
                        let groupSocket = ChatRoom.getGroup(socket.id);
                        if (groupSocket) {

                            message.fullName = user.fullName;
                            message.avatarUrl = user.avatarUrl;
                            
                            for (let userId in groupSocket) {
                                let sockets = groupSocket[userId];
                                for (let i = 0; i < sockets.length; i++) {
                                    io.to(sockets[i]).emit('new_message', message);
                                }
                            }
                        }
                    }
                })
            })

            socket.on('disconnect', function () {
                ChatRoom.leaveRoom(socket.id);
            })
        })
    } catch (error) {
        console.log(error.message)
    }
}
