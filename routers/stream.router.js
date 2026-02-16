const { multipleupload } = require("../config/multer.config")
const { createStream, getActive, getSingle, endStream, getCreatorActiveStream, getToken, createMessage, getMessages, getUserStreams, increaseBiddingTimer, createBidding, getAllBidding, getLive } = require("../services/stream.service")
const router = require("express").Router()
router.post("/create", multipleupload.single("image"), createStream)
router.get("/active", getActive)
router.get("/live", getLive)
router.get("/single/:id", getSingle)
router.get("/stream/:id", getCreatorActiveStream)
router.put("/end/:id", endStream)
router.get("/token/:id/:role", getToken)
router.post("/message", createMessage);
router.get("/message/:streamId", getMessages);
router.get("/user/:id", getUserStreams);

router.post("/bidding/timer", increaseBiddingTimer);
router.post("/bidding", createBidding);
router.get("/biddings/:streamId", getAllBidding);
router.get("/user/:id", getUserStreams);

module.exports = router