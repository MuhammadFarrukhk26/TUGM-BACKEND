const { multipleupload } = require("../config/multer.config")
const {createStream, getActive, getSingle, endStream, getCreatorActiveStream, getToken, createMessage, getMessages, getUserStreams } = require("../services/stream.service")
const router = require("express").Router()
router.post("/create",multipleupload.single("image"),createStream)
router.get("/active",getActive)
router.get("/single/:id",getSingle)
router.get("/stream/:id",getCreatorActiveStream)
router.put("/end/:id",endStream)
router.get("/token/:id/:role",getToken)
router.post("/message", createMessage);
router.get("/message/:streamId", getMessages);
router.get("/user/:id", getUserStreams);

module.exports = router