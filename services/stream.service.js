const { generateZegoStream, uploadFile, generateAgoraToken } = require("../utils/function");
const LiveStream = require("../models/stream.model");
const Bidding = require("../models/bidding.model");
const BattleMessage = require("../models/battleMessage.model");
const { emitToUser } = require("../config/socket.config");
const { AccountModel } = require("../models/account.model");

// const createStream = async (req, res) => {
//     try {
//         const { startingBid, creatorId, productId } = req.body;
//         let image = req.file
//         let url = await uploadFile(image);
//         console.log(url, 'url');
//         const { streamId, token } = await generateZegoStream(creatorId);
//         const newStream = new LiveStream({ startingBid, creatorId, streamId, token, coverImage: url, productId });
//         await newStream.save();
//         res.status(200).json({ data: newStream, msg: "Stream Started" });
//     }
//     catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
const createStream = async (req, res) => {
    try {
        const {
            startingBid,
            creatorId,
            productId,
            mode,
            duration,       // seconds
            suddenDeath
        } = req.body;

        if (!creatorId || !productId || !mode) {

            return res.status(400).json({
                error: `creatorId, productId and mode are required ${creatorId}, ${productId}, ${mode}`
            });
        }

        // if (mode === "AUCTION") {
        //     if (!startingBid || !duration) {
        //         return res.status(400).json({
        //             error: `startingBid and duration required for auction ${startingBid}, ${duration}`
        //         });
        //     }
        // }
        const existingLive = await LiveStream.findOne({ productId, status: "LIVE" });
        if (existingLive) {
            return res.status(400).json({ error: "Stream already live for this product" });
        }
        // if (mode === "AUCTION") {
        //     if (!startingBid || !duration || isNaN(Number(duration))) {
        //         return res.status(400).json({
        //             error: "startingBid and valid duration are required for auction"
        //         });
        //     }
        // }

        let coverImage = null;
        if (req.file) {
            coverImage = await uploadFile(req.file);
        }

        const { streamId, token } = await generateZegoStream(creatorId);

        // const startTime = new Date();
        // let endTime = null;
        // if (mode === "AUCTION") {
        //     const durationSeconds = Number(duration);
        //     if (isNaN(durationSeconds) || durationSeconds <= 0) {
        //         return res.status(400).json({ error: "duration must be a positive number" });
        //     }
        //     endTime = new Date(startTime.getTime() + durationSeconds * 1000 + 1000);

        //     if (endTime <= startTime) {
        //         return res.status(400).json({ error: "endTime must be greater than startTime" });
        //     }
        //     if (mode === "AUCTION") {
        //         endTime = new Date(startTime.getTime() + durationSeconds * 1000 + 1000);
        //     }

        // }
        const startTime = new Date();
        let endTime = null;

        if (mode === "AUCTION") {

            if (!startingBid || !duration) {
                return res.status(400).json({
                    error: "startingBid and duration are required for AUCTION mode"
                });
            }

            const durationSeconds = Number(duration);

            if (isNaN(durationSeconds) || durationSeconds <= 0) {
                return res.status(400).json({
                    error: "duration must be a positive number (in seconds)"
                });
            }

            endTime = new Date(startTime.getTime() + durationSeconds * 1000);
        }
        const newStream = new LiveStream({
            creatorId,
            productId,
            mode,

            startingBid: mode === "AUCTION" ? Number(startingBid) : null,
            currentBid: mode === "AUCTION" ? Number(startingBid) : null,

            suddenDeath: mode === "AUCTION" ? Boolean(suddenDeath) : false,

            startTime,
            endTime,
            status: "LIVE",

            streamId,
            token,
            coverImage
        });

        await newStream.save();

        res.status(201).json({
            data: newStream,
            msg: "Stream Started"
        });

    } catch (error) {
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
const getLive = async (req, res) => {
    try {
        const activeStreams = await LiveStream.find({ status: "LIVE" }).populate("creatorId");
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
// const endStream = async (req, res) => {
//     try {
//         const stream = await LiveStream.findByIdAndUpdate(req.params.id, { status: "ended" }, { new: true });
//         if (!stream) return res.status(404).json({ error: "Stream not found" });
//         return res.status(200).json({ data: stream, msg: "Stream Ended", status: 200 });
//     }
//     catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
// const endStream = async (req, res) => {
//     try {
//         // Find the stream by its streamId
//         const stream = await LiveStream.findOne({ streamId: req.params.id });
//         console.log(stream, 'stream of end stream');

//         if (!stream) {
//             return res.status(404).json({ error: "Stream not found" });
//         }

//         // Set the winnerId to highestBidder and mark stream as completed
//         stream.status = "COMPLETED";
//         stream.winnerId = stream.highestBidder || null; // <-- ensure winnerId is set
//         await stream.save();

//         // Emit the auction ended event to the user
//         emitToUser(stream.streamId.toString(), "auctionEnded", {
//             winner: stream.winnerId,
//             finalPrice: stream.currentBid
//         });

//         return res.status(200).json({
//             data: stream,
//             msg: "Stream Ended"
//         });

//     } catch (error) {
//         console.error('Error ending stream:', error);
//         res.status(500).json({ error: error.message });
//     }
// };


const endStream = async (req, res) => {
    try {
        // Find the stream by its streamId
        const stream = await LiveStream.findOne({ streamId: req.params.id });
        console.log(stream, 'stream of end stream');

        if (!stream) {
            return res.status(404).json({ error: "Stream not found" });
        }

        // Set the winnerId to highestBidder and mark stream as completed
        stream.status = "COMPLETED";
        stream.winnerId = stream.highestBidder || null;

        let winnerName = null;
        let winnerImage = null;
        if (stream.winnerId) {
            // Fetch winner details from Account/User model
            const winner = await AccountModel.findById(stream.winnerId);
            winnerImage = winner?.profile || null;
            winnerName = winner ? winner.username : null; // or use firstName + lastName if applicable
        }

        await stream.save();

        // Emit the auction ended event to the user
        emitToUser(stream.streamId.toString(), "auctionEnded", {
            winnerId: stream.winnerId,
            winnerName: winnerName,
            finalPrice: stream.currentBid
        });

        return res.status(200).json({
            data: stream,
            msg: "Stream Ended",
            winner: {
                id: stream.winnerId,
                name: winnerName,
                Image: winnerImage
            }
        });

    } catch (error) {
        console.error('Error ending stream:', error);
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

        if (!stream) return res.status(404).json({ error: "Stream not found" });

        const now = Date.now();
        const nowTime = new Date(now).getTime()
        const currentEnd = new Date(stream.endTime).getTime();
        const currentDate = new Date(stream?.endTime)
        console.log("Now:", new Date());
        console.log("Current endTime:", stream.endTime);
        let isExceeded = currentEnd <= nowTime ? true : false
        console.log(isExceeded)
        if (currentEnd <= nowTime)
            return res.status(400).json({ error: "Auction already ended" });
        if (biddingEndTime <= 0) {
            return res.status(400).json({ error: "biddingEndTime must be positive" });
        }
        // Extend the current endTime
        stream.endTime = new Date(currentEnd + biddingEndTime * 1000);

        await stream.save();

        emitToUser(stream.streamId.toString(), "biddingTimeUpdated", {
            endTime: stream.endTime
        });

        res.status(200).json({
            data: stream,
            msg: "Bidding time extended"
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal server error ${error}` });
    }
};


const createBidding = async (req, res) => {
    try {
        const { streamId, bidderId, bidAmount } = req.body;

        if (!streamId || !bidderId || !bidAmount) {
            return res.status(400).json({
                error: "streamId, bidderId and bidAmount are required"
            });
        }

        const stream = await LiveStream.findById(streamId);

        if (!stream) {
            return res.status(404).json({ error: "Stream not found" });
        }

        // 1️⃣ Check mode
        if (stream.mode !== "AUCTION") {
            return res.status(400).json({
                error: "Bidding not allowed in Buy Now mode"
            });
        }

        // 2️⃣ Check status
        if (stream.status !== "LIVE") {
            return res.status(400).json({
                error: "Auction is not active"
            });
        }

        // 3️⃣ Check expiration
        if (new Date() > stream.endTime) {
            stream.status = "COMPLETED";
            await stream.save();

            return res.status(400).json({
                error: "Auction has ended"
            });
        }

        // 4️⃣ Validate bid amount
        if (Number(bidAmount) <= stream.currentBid) {
            return res.status(400).json({
                error: "Bid must be higher than current bid"
            });
        }

        // 5️⃣ Save bid
        const newBidding = new Bidding({
            streamId,
            bidderId,
            bidAmount: Number(bidAmount)
        });

        await newBidding.save();

        // 6️⃣ Update stream
        stream.currentBid = Number(bidAmount);
        stream.highestBidder = bidderId;

        // 7️⃣ Sudden death logic
        if (stream.suddenDeath) {
            const remaining =
                new Date(stream.endTime) - new Date();

            if (remaining <= 10000) {
                // extend 10 seconds
                stream.endTime = new Date(
                    new Date(stream.endTime).getTime() + 10000
                );
            }
        }

        await stream.save();

        const populatedBidding =
            await newBidding.populate("bidderId");

        // Emit real-time update
        emitToUser(stream.streamId.toString(), "newBidding", {
            bid: populatedBidding,
            currentBid: stream.currentBid,
            endTime: stream.endTime
        });

        return res.status(200).json({
            data: populatedBidding,
            msg: "Bid placed successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

const getAllBidding = async (req, res) => {
    try {
        const { streamId } = req.params; // e.g., 'stream_6992ea5e8d040b1d00b77a25_1771526681674'
        // console.log(streamId, 'streamId of get all bidding')
        const biddings = await Bidding
            .find({ streamId }) // use the full key exactly as stored
            .populate("bidderId")
            .sort({ bidAmount: -1, createdAt: 1 }); // tie-break by earliest bid

        res.status(200).json({ data: biddings, msg: "Biddings fetched" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};
const getUserStreams = async (req, res) => {
    try {
        const activeStreams = await LiveStream.find({ creatorId: req?.params?.id }).populate("productId")
        res.status(200).json({ data: activeStreams, msg: "" });
    } catch (error) {
        console.log(error)
    }
}

module.exports = { increaseBiddingTimer, createBidding, getAllBidding, createStream, getActive, getLive, getSingle, endStream, getCreatorActiveStream, getToken, createMessage, getMessages, getUserStreams };
