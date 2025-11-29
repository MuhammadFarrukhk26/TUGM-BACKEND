const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    video: { type: String },
    text: { type: String },
    songId: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
    comments: [commentSchema],
    views: { type: Number, default: 0 }, // <-- add this
    createdAt: { type: Date, default: Date.now }
});

const PostModel = mongoose.model("Post", postSchema, "Post");

module.exports = { PostModel };
