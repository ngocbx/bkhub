var PostModel = require("../models/PostModel");
var UserService = require("../services/UserService");
var PostService = require("../services/PostService");
var Exception = require("../utils/ExceptionHandler");
var dateFormat = require('dateformat');

module.exports.getAllPost = async (req, res) => {

    try {
        let userId = req.user._id;

        PostModel.find({}, (err, list) => {
            if (err) {
                return Exception.internalServerError(res, err.message)
            } else if (!list) {
                return Exception.notFound(res, "Status not found!")
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
                    responseList.unshift(responsePost);
                })
                return res.status(200).json(responseList)
            }
        })
    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
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

module.exports.createPost = async (req, res) => {

    try {
        let user = req.user;
        let content = req.body.content;
        let images = req.body.images || [];

        if (!content || content.length <= 0) {
            return Exception.badRequest(res, "Content must not be empty!");
        }

        var post = PostModel({
            author: user.username,
            authorName: user.fullName,
            authorAvatar: user.avatarUrl,
            content: content,
            images: images
        })

        PostModel.create(post, (err) => {
            if (err) {
                return Exception.internalServerError(res, err.message)
            } else {
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
                    isLike: false
                }
                return res.status(200).json(responsePost)
            }
        })
    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
}

module.exports.updatePost = async (req, res) => {
    try {
        var user = req.user;

        var postId = req.params.postId;
        var newContent = req.body.content;
        var images = req.body.images || [];

        let post =
            await PostService.getPost(postId)
                .catch(() => {
                    return undefined;
                });
        if (!post) {
            return Exception.badRequest(res, "PostId is incorrect!");
        } else if (post.author != user.username) {
            return Exception.unauthorized(res, "Access denied!")
        } else if (!newContent || newContent.length <= 0) {
            return Exception.badRequest(res, "New content must not be empty!");
        }

        post.content = newContent;
        post.images = images;
        post.save((err) => {
            if (err) {
                return Exception.internalServerError(res, error.message)
            } else {
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
                    isLike: false
                }
                return res.status(200).json(responsePost)
            }
        })
    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
}

module.exports.deletePost = async (req, res) => {

    try {
        var postId = req.params.postId;
        let user = req.user;

        let post =
            await PostService.getPost(postId)
                .catch(() => {
                    return undefined;
                });
        if (!post) {
            return Exception.badRequest(res, "PostId is incorrect!");
        } else if (post.author != user.username) {
            return Exception.unauthorized(res, "Access denied!")
        }

        post.remove((err) => {
            if (err) {
                return Exception.internalServerError(res, error.message)
            } else {
                return res.status(200).json({
                    "message": "Delete status successfully!"
                })
            }
        })
    } catch (error) {
        return Exception.internalServerError(res, error.message)
    }
}

module.exports.likePost = async (req, res) => {

    try {
        let user = req.user;
        let postId = req.body.postId;

        let post =
            await PostService.getPost(postId)
                .catch(() => {
                    return undefined;
                });
        if (!post) {
            return Exception.badRequest(res, "PostId is incorrect!");
        }

        likeOrUnlike(post, user);
        post.save((err) => {
            if (err) {
                return Exception.internalServerError(res, error.message)
            } else {
                return res.status(200).json({
                    massage: "Update successfully!"
                })
            }
        })
    } catch (error) {
        Exception.internalServerError(res, error.message)
    }
}

var likeOrUnlike = (post, user) => {
    var likeList = post.likeList;
    var isLike = false;
    for (var likeModel of likeList) {
        if (likeModel.userId == user.id) { // this user has like before
            isLike = true;
            likeList.remove(likeModel);
            post.numberLike--;
            return;
        }
    }
    if (!isLike) {
        var likeModel = {
            userId: user.id,
            fullName: user.fullName,
            userAvatar: user.avatarUrl
        }
        post.likeList.push(likeModel);
        post.numberLike++;
    }
}

module.exports.comment = async (req, res) => {

    try {
        let user = req.user;

        let postId = req.body.postId;
        let content = req.body.content;

        if (!content || content.length <= 0) {
            return Exception.badRequest(res, "Content must not be empty!");
        }

        let post =
            await PostService.getPost(postId)
                .catch(() => {
                    return undefined;
                });
        if (!post) {
            return Exception.badRequest(res, "PostId is incorrect!");
        }

        var commentModel = {
            fullName: user.fullName,
            username: user.username,
            userAvatar: user.avatarUrl,
            content: content
        }
        post.commentList.push(commentModel);
        post.numberComment++;
        post.save((err) => {
            if (err) {
                return Exception.internalServerError(res, error.message)
            } else {
                return res.status(200).json(commentModel)
            }
        })

    } catch (error) {
        Exception.internalServerError(res, error.message)
    }
}

module.exports.getAllComment = async (req, res) => {
    try {
        var postId = req.query.postId;
        let post =
            await PostService.getPost(postId)
                .catch(() => {
                    return undefined;
                });
        if (!post) {
            return Exception.badRequest(res, "PostId is incorrect!");
        } else {
            return res.status(200).json(post.commentList)
        }
    } catch (error) {
        Exception.internalServerError(res, error.message)
    }
}