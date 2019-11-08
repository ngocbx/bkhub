var PostModel = require("../models/PostModel");
var dateFormat = require('dateformat');

module.exports.getPost = (postId) => {
    return new Promise((resolve, reject) => {
        PostModel.findOne({ _id: postId }, (err, post) => {
            if (!err) {
                return resolve(post);
            } else {
                return reject(err);
            }
        })
    })
}


module.exports.getPostOfUser = (userId, username) => {
    return new Promise((resolve, reject) => {
        PostModel.find({ author: username }, (err, list) => {
            if (err) {
                return reject(err);
            } else {
                var responseList = [];
                list.forEach((post) => {
                    var isLike = checkUserLike(userId, post.likeList);
                    var responsePost = {
                        postId: post.id,
                        author: post.author,
                        authorName: post.authorName,
                        authorAvatar: post.authorAvatar,
                        content: post.content,
                        images: post.images,
                        createDate: dateFormat(post.createDate, "dd/mm/yyyy"),
                        numberLike: post.numberLike,
                        numberComment: post.numberComment,
                        isLike: isLike
                    }
                    responseList.push(responsePost);
                })
                return resolve(responseList);
            }
        })
    })
}

var checkUserLike = (userId, likeList) => {
    if (likeList) {
        for (var like of likeList) {
            if (like.userId == userId) {
                return true;
            }
        }
    }
    return false;
}