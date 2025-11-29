const router = require("express").Router();
const { multipleupload } = require("../config/multer.config");
const { createPost, getAllPosts, getPostsByUser, toggleLikePost, addComment, incrementPostViews, getPostById } = require("../services/post.service");

// Create post with video
router.post("/create", multipleupload.single("video"), createPost);

// Get all posts
router.get("/all", getAllPosts);

router.put("/view/:postId", incrementPostViews);


// Get posts by creator
router.get("/user/:id", getPostsByUser);

// Like/unlike a post
router.put("/like", toggleLikePost);

// Add comment
router.put("/comment", addComment);

router.get("/:postId", getPostById);

module.exports = router;
