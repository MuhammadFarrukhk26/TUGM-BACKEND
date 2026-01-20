const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
    streamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveStream",
        default: null, // Null for regular orders
    },
    bidderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    biddingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bidding",
        default: null,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    total: {
        type: Number,
        required: true, // Bid amount or order total
    },
    customer_address: {
        type: String,
        default: "Address Pending",
    },
    city: {
        type: String,
        default: "",
    },
    state: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "",
    },
    zip: {
        type: String,
        default: "00000",
    },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending",
    },
    trackingId: {
        type: String,
        default: null,
    },
    shippingLabel: {
        url: { type: String, default: null },
        generatedAt: { type: Date, default: null },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const ShipmentModel = mongoose.model("Shipment", shipmentSchema, "Shipment");

module.exports = { ShipmentModel };