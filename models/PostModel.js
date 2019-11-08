var mongoose = require("mongoose");
var image = require("../constant/image.js");
var Schema = mongoose.Schema;

var likeSchema = new Schema({
    userId: String,
    fullName: String,
    userAvatar: {
        type: String,
        default: image.AVATAR
    }
}, { versionKey: false, _id: false })

var commentSchema = new Schema({
    fullName: String,
    userAvatar: {
        type: String,
        default: image.AVATAR
    },
    content: String
}, { versionKey: false, _id: false })

var postSchema = new Schema({
    author: String,
    authorName: String,
    authorAvatar: {
        type: String,
        default: image.AVATAR
    },
    content: String,
    images: [String],
    createDate: {
        type: Date,
        default: new Date()
    },
    numberLike: {
        type: Number,
        default: 0
    },
    numberComment:  {
        type: Number,
        default: 0
    },
    likeList: [likeSchema],
    commentList: [commentSchema]

}, { versionKey: false });

module.exports = mongoose.model("Post", postSchema);