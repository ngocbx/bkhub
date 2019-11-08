var express = require("express");
var router = express.Router();
var PostController = require("../controllers/PostController")
var verifyToken = require("../utils/LoginUtils")

router.get("/get-all", verifyToken, (req, res) => {
    return PostController.getAllPost(req, res);
})

router.post("/", verifyToken, (req, res) => {
    return PostController.createPost(req, res);
})

router.put("/:postId", verifyToken, (req, res) => {
    return PostController.updatePost(req, res);
})

router.delete("/:postId", verifyToken, (req, res) => {
    return PostController.deletePost(req, res);
})

router.post("/like", verifyToken, (req, res) => {
    return PostController.likePost(req, res);
})

router.post("/comment", verifyToken, (req, res) => {
    return PostController.comment(req, res);
})

router.get("/get-comment", verifyToken, (req, res) => {
    return PostController.getAllComment(req, res);
})

module.exports = router;
