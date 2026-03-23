// const mongoose = require("mongoose");

// const LiveStreamSchema = new mongoose.Schema({
//     creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
//     productId: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Product",
//         },
//     ],
//     startingBid: { type: Number, required: true },
//     coverImage: { type: String, required: true },
//     streamId: { type: String, required: true },
//     token: { type: String, required: true },
//     status: { type: String, enum: ["active", "ended"], default: "active" },
//     biddingEndTime: { type: Number, default: 5 },
//     winnerId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Account",
//         default: null,
//     },
//     shipmentId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Shipment",
//         default: null,
//     },
//     createdAt: { type: Date, default: Date.now },
// });
// LiveStreamSchema.path("productId").default(() => []);
// module.exports = mongoose.model("LiveStream", LiveStreamSchema);

const mongoose = require("mongoose");

const LiveStreamSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },

  productId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],

  // 🔵 Mode Control
  mode: {
    type: String,
    enum: ["AUCTION", "BUY_NOW"],
    default: "AUCTION",
  },

  // 🔵 Optional auction references (multiple auctions per stream)
  auctionIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
    },
  ],

  // 🔵 Stream Timing / lifecycle control (stream-level, not auction-level)
  startTime: {
    type: Date,
    default: Date.now,
  },

  endTime: {
    type: Date,
    default: null,
  },
  suddenDeath: {
    type: Boolean,
    default: false,
  },

  // 🔵 Stream Data
  coverImage: {
    type: String,
    required: true,
  },

  streamId: {
    type: String,
    required: true,
  },

  token: {
    type: String,
    required: true,
  },

  // 🔵 Lifecycle
  status: {
    type: String,
    enum: ["LIVE", "COMPLETED", "CANCELLED"],
    default: "LIVE",
  },

  // 🔵 Post-Auction
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    default: null,
  },

  shipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shipment",
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

LiveStreamSchema.path("productId").default(() => []);

module.exports = mongoose.model("LiveStream", LiveStreamSchema);


