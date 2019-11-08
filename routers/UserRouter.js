var express = require("express");
var router = express.Router();
var UserController = require("../controllers/UserController")
var verifyToken = require("../utils/LoginUtils")

router.post("/login", (req, res) => {
    return UserController.login(req, res);
})

router.post("/register", (req, res) => {
    return UserController.register(req, res);
})

router.get("/get-user-by-phone", (req, res) => {
    return UserController.getUserByPhone(req, res);
})

router.get("/get-user-by-email", (req, res) => {
    return UserController.getUserByEmail(req, res);
})

router.get("/get-all", verifyToken, (req, res) => {
    return UserController.getAll(req, res);
})

router.get("/get-detail", verifyToken, (req, res) => {
    return UserController.getDetail(req, res);
})

router.put("/update-avatar", verifyToken, (req, res) => {
    return UserController.updateAvatar(req, res);
})

router.put("/update-coverphoto", verifyToken, (req, res) => {
    return UserController.updateCoverPhoto(req, res);
})

router.put("/update-profile", verifyToken, (req, res) => {
    return UserController.updateProfile(req, res);
})

module.exports = router;
