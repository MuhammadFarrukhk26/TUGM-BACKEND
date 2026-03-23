const Bidding = require("../models/bidding.model");

const getAllBidding = async (req, res) => {
    try {
        const { id } = req.params;
        const bids = await Bidding.find({ $or: [{ streamId: id }, { auctionId: id }] })
            .populate("bidderId")
            .sort({ bidAmount: -1, createdAt: 1 });

        res.status(200).json({ data: bids, msg: "Biddings fetched" });
    } catch (error) {
        console.error("getAllBidding error", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllBidding }