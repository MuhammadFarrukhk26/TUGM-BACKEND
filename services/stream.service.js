const { generateZegoStream, uploadFile, generateAgoraToken } = require("../utils/function");
const LiveStream = require("../models/stream.model");
const Bidding = require("../models/bidding.model");
const BattleMessage = require("../models/battleMessage.model");
const { emitToUser } = require("../config/socket.config");

const createStream = async (req, res) => {
    try {
        const { startingBid, creatorId, productId } = req.body;
        let image = req.file
        let url = await uploadFile(image);
        console.log(url, 'url');
        const { streamId, token } = await generateZegoStream(creatorId);
        const newStream = new LiveStream({ startingBid, creatorId, streamId, token, coverImage: url, productId });
        await newStream.save();
        res.status(200).json({ data: newStream, msg: "Stream Started" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getActive = async (req, res) => {
    try {
        const activeStreams = await LiveStream.find({ status: "active" }).populate("creatorId");
        res.status(200).json({ data: activeStreams, msg: "" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getCreatorActiveStream = async (req, res) => {
    try {
        const activeStreams = await LiveStream.findOne({ streamId: req?.params?.id }).populate("creatorId").populate("productId")
        res.status(200).json({ data: activeStreams, msg: "" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const endStream = async (req, res) => {
    try {
        const stream = await LiveStream.findByIdAndUpdate(req.params.id, { status: "ended" }, { new: true });
        if (!stream) return res.status(404).json({ error: "Stream not found" });
        return res.status(200).json({ data: stream, msg: "Stream Ended", status: 200 });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSingle = async (req, res) => {
    try {
        const stream = await LiveStream.findById(req.params.id);
        return res.status(200).json({ data: stream, msg: "", status: 200 });
    }
    catch (error) {
        console.error("Error deleting note:", error);
        return { success: false, msg: "Failed to delete note" };
    }
};

const getToken = async (req, res) => {
    try {
        let id = req.params.id
        let role = req.params.role
        let token = await generateAgoraToken(id, role)
        return res.status(200).json({ data: token })
    }
    catch (error) {
        console.log(error)
    }
}

const createMessage = async (req, res) => {
    try {
        const { streamId, userId, message } = req.body;
        if (!streamId || !userId || !message) {
            return res.status(400).json({ error: "streamId, userId and message are required" });
        }
        const newMessage = new BattleMessage({ streamId, userId, message });
        await newMessage.save();
        const populatedMessage = await BattleMessage.findById(newMessage._id).populate("userId");
        emitToUser(streamId.toString(), "newMessage", populatedMessage);
        res.status(200).json({ data: populatedMessage, msg: "Message sent" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getMessages = async (req, res) => {
    try {
        const { streamId } = req.params;
        const messages = await BattleMessage.find({ streamId }).populate("userId").sort({ createdAt: 1 });
        res.status(200).json({ data: messages, msg: "Messages fetched" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const increaseBiddingTimer = async (req, res) => {
    try {
        const { streamId, biddingEndTime } = req.body;
        const stream = await LiveStream.findById(streamId);
        if (!stream) {
            return res.status(404).json({ error: "Stream not found" });
        }
        stream.biddingEndTime = stream.biddingEndTime + biddingEndTime
        await stream.save();
        emitToUser(stream.streamId.toString(), "biddingTimeUpdated", { biddingEndTime: stream.biddingEndTime });
        res.status(200).json({ data: stream, msg: "Bidding time increased" });
    } catch (error) {
        console.log(error)
    }
}

const createBidding = async (req, res) => {
    try {
        const { streamId, bidderId, bidAmount } = req.body;
        console.log(streamId,'streamId of create bidding')
        if (!streamId || !bidderId || !bidAmount) {
            return res.status(400).json({ error: "streamId, bidderId and bidAmount are required" });
        }

        const stream = await LiveStream.findById(streamId);
        if (!stream) {
            return res.status(404).json({ error: "Stream not found" });
        }
        const newBidding = new Bidding({ streamId, bidderId, bidAmount });
        await newBidding.save();
        const populatedBidding = await newBidding.populate("bidderId");
        emitToUser(stream.streamId.toString(), "newBidding", populatedBidding);

        return res.status(200).json({
            data: populatedBidding,
            msg: "Bidding created"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


const getAllBidding = async (req, res) => {
    try {
        const { streamId } = req.params;
        console.log(streamId,'streamId of get all bidding')
        const biddings = await Bidding.find({ streamId }).populate("bidderId").sort({ bidAmount: -1 });
        res.status(200).json({ data: biddings, msg: "Biddings fetched" });
    } catch (error) {
        console.log(error)
    }
}

const getUserStreams = async (req, res) => {
    try {
        const activeStreams = await LiveStream.find({ creatorId: req?.params?.id }).populate("productId")
        res.status(200).json({ data: activeStreams, msg: "" });
    } catch (error) {
        console.log(error)
    }
}

module.exports = { increaseBiddingTimer, createBidding, getAllBidding, createStream, getActive, getSingle, endStream, getCreatorActiveStream, getToken, createMessage, getMessages, getUserStreams };
