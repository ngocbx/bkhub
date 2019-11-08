var mongoose = require("mongoose");
var image = require("../constant/image.js");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    password: String,
    fullName: String,
    address: String,
    birthday: String,
    phone: String,
    email: String,
    avatarUrl: {
        type: String,
        default: image.AVATAR[0]
    },
    coverPhoto: {
        type: [String],
        default: [image.COVER_PHOTO_1, image.COVER_PHOTO_2, image.COVER_PHOTO_3]
    }
}, { versionKey: false });

module.exports = mongoose.model("User", userSchema);