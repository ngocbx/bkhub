var express = require("express");
var router = express.Router();
var GroupChatController = require("../controllers/GroupChatController")
var verifyToken = require("../utils/LoginUtils")

router.get("/all-group", verifyToken, (req, res) => {
    return GroupChatController.getAllGroup(req, res);
})

router.get("/all-message", verifyToken, (req, res) => {
    return GroupChatController.getAllMessage(req, res);
})

router.post("/create-group", verifyToken, (req, res) => {
    return GroupChatController.createGroup(req, res);
})

router.put("/update-group-name", verifyToken, (req, res) => {
    return GroupChatController.updateGroupName(req, res);
})
module.exports = router;

