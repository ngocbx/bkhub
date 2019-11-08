
module.exports.joinRoom = (groupId, userId, socketId) => {

    let socketIds = global.socketIds;
    if (!socketIds) {
        socketIds = {};
    }
    if (!socketIds[groupId]) {
        socketIds[groupId] = {};
    }
    if (!socketIds[groupId][userId]) {
        socketIds[groupId][userId] = [];
    }

    if (!socketIds[groupId][userId].includes(socketId)) {
        socketIds[groupId][userId].push(socketId);
    }

    global.socketIds = socketIds;
}

module.exports.getGroup = (socketId) => {

    let socketIds = global.socketIds;
    if (!socketIds) {
        return undefined;
    }

    for (let groupId in socketIds) {
        let group = socketIds[groupId];
        for (let userId in group) {
            let user = group[userId];
            if (user.includes(socketId)) {
                return group;
            }
        }
    }
    return undefined;
}

module.exports.leaveRoom = (socketId) => {

    let socketIds = global.socketIds;
    if (!socketIds) {
        return;
    }

    for (let groupId in socketIds) {
        let group = socketIds[groupId];
        for (let userId in group) {
            let user = group[userId];
            for (let i = 0; i < user.length; i++) {
                if (user[i] == socketId) {
                    user.splice(i, 1);
                }
            }
            if (user.length === 0) {
                delete group[userId];
            }
        }
        if (Object.keys(group).length === 0) {
            delete socketIds[groupId]
        }
    }

    global.socketIds = socketIds;
}


// global sockerIds format
// {
//     "groupId" : {
//         "userId1" : [
//             "socketId_Device1",
//             "socketId_Device2",
//             "socketId_Device3"
//         ],
//             "userId2" : [
//                 "socketId_Device1",
//                 "socketId_Device2",
//                 "socketId_Device3"
//             ]
//     },
//     "groupId2" : {
//         "userId1" : [
//             "socketId_Device1",
//             "socketId_Device2",
//             "socketId_Device3"
//         ],
//             "userId2" : [
//                 "socketId_Device1",
//                 "socketId_Device2",
//                 "socketId_Device3"
//             ]
//     }
// }