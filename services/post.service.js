const { PostModel } = require("../models/post.model");
const { uploadFile } = require("../utils/function"); // your upload function

// Create a new post
const createPost = async (req, res) => {
    try {
        const { userId, text, songId } = req.body;
        let video = null;

        if (req.file) {
            video = await uploadFile(req.file);
        }

        const post = new PostModel({ userId, text, songId, video });
        await post.save();

        return res.status(200).json({ data: post, msg: "Post created successfully", status: 200 });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({ success: false, msg: "Failed to create post" });
    }
};

// Get all posts
const getAllPosts = async (req, res) => {
    try {
        const posts = await PostModel.find({})
            .populate("userId", "username profile") // post creator
            .populate("comments.userId", "username profile"); // comments user

        return res.status(200).json({ data: posts, msg: null, status: 200 });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ success: false, msg: "Failed to fetch posts" });
    }
};

// Get posts by creator
const getPostsByUser = async (req, res) => {
    try {
        const posts = await PostModel.find({ userId: req.params.id })
            .populate("userId", "username profile")
            .populate("comments.userId", "username profile");

        return res.status(200).json({ data: posts, msg: null, status: 200 });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ success: false, msg: "Failed to fetch posts" });
    }
};

// Like/unlike a post
const toggleLikePost = async (req, res) => {
    try {
        const { postId, userId } = req.body;
        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ msg: "Post not found" });

        if (post.likes.includes(userId)) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        return res.status(200).json({ data: post.likes, msg: "Post like toggled", status: 200 });
    } catch (error) {
        console.error("Error toggling like:", error);
        return res.status(500).json({ success: false, msg: "Failed to toggle like" });
    }
};

// Add comment
const addComment = async (req, res) => {
    try {
        const { postId, userId, comment } = req.body;
        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ msg: "Post not found" });

        post.comments.push({ userId, comment });
        await post.save();

        // Populate newly added comment's userId before returning
        await post.populate("comments.userId", "username profile");

        return res.status(200).json({ data: post.comments, msg: "Comment added", status: 200 });
    } catch (error) {
        console.error("Error adding comment:", error);
        return res.status(500).json({ success: false, msg: "Failed to add comment" });
    }
};

const incrementPostViews = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ msg: "Post not found" });

        post.views += 1;
        await post.save();

        return res.status(200).json({ data: post.views, msg: "Post view updated", status: 200 });
    } catch (error) {
        console.error("Error updating post views:", error);
        return res.status(500).json({ success: false, msg: "Failed to update post views" });
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.postId)
            .populate("userId", "username profile") // post creator
            .populate("comments.userId", "username profile"); // comment user

        if (!post) return res.status(404).json({ msg: "Post not found" });
        return res.status(200).json({ data: post, msg: null, status: 200 });
    } catch (error) {
        console.error("Error fetching post:", error);
        return res.status(500).json({ success: false, msg: "Failed to fetch post" });
    }
};

module.exports = { createPost, getAllPosts, getPostsByUser, toggleLikePost, addComment, incrementPostViews,getPostById };
