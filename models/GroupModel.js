var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var messageSchema = new Schema({
    userId: String,
    content: String
}, { versionKey: false, _id: false });

var groupSchema = new Schema({
    name: {
        type: String,
        default: "HubBook Group"
    },
    users: [String],
    messages: [messageSchema]
}, { versionKey: false });

module.exports = mongoose.model("Group", groupSchema);