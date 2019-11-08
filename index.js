var express = require("express");
var mongoose = require("mongoose");
var config = require("./constant/databaseConfig");

var UserRouter = require("./routers/UserRouter");
var PostRouter = require("./routers/PostRouter");
var GroupChatRouter = require("./routers/GroupChatRouter");

var app = express();
var server = require("http").Server(app);

var socketHandler = require("./utils/SocketHandler");
socketHandler.connect(server);

app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

//Connect to mongoose
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.databaseName}`,
    { useNewUrlParser: true }).then(
        () => {
            console.log("Connect DB successfully !");
        },
        err => {
            console.log(err);
            console.log("Connect DB fail !");
        }
    );

app.use("/api/user", UserRouter);
app.use("/api/post", PostRouter);
app.use("/api/chat", GroupChatRouter);

app.get("/", (req, res) => {
    res.json("Welcome to HubBook API")
});

server.listen(process.env.PORT || 3000, () => {
    console.log("App listening on port 3000");
});