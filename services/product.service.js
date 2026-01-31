const { ProductModel } = require("../models/product.model");
const { uploadFile } = require("../utils/function");

const createProduct = async (req, res) => {
    try {
        let { size, userId, title, description, listing_type, shipping_type, categories, tags, colors, weight, dimensions, quantity, price, stock } = req.body;

        let files = req.files;
        let urls = [];

        if (files && files.length > 0) {
            for (let index = 0; index < files.length; index++) {
                const element = await uploadFile(files[index]);
                urls.push(element);
            }
        }
        console.log(urls,'urls');
        const Product = new ProductModel({ size, images: urls, userId, title, description, listing_type, shipping_type, categories: JSON.parse(categories), tags: JSON.parse(tags), colors: JSON.parse(colors), weight, dimensions, quantity, price, stock });
        await Product.save();
        return res.status(200).json({ data: Product, msg: "Product created successfully", status: 200 });
    } catch (error) {
        console.error("Error creating Product:", error);
        return res.status(500).json({ success: false, msg: "Failed to create product" });
    }
};


const getAllProduct = async (req, res) => {
    try {
        const Product = await ProductModel.find({})
        return res.status(200).json({ data: Product, msg: null, status: 200 });
    } catch (error) {
        console.error("Error fetching Post:", error);
        return { success: false, msg: "Failed to fetch Post" };
    }
};
const getAllProductSeller = async (req, res) => {
    try {
        const Product = await ProductModel.find({ userId: req?.params?.id})
        return res.status(200).json({ data: Product, msg: null, status: 200 });
    } catch (error) {
        console.error("Error fetching Post:", error);
        return { success: false, msg: "Failed to fetch Post" };
    }
};
const getSingleProduct = async (req, res) => {
    try {
        const Product = await ProductModel.findById(req?.params?.id);
        return res.status(200).json({ data: Product, msg: null, status: 200 });
    } catch (error) {
        console.error("Error fetching Post:", error);
        return { success: false, msg: "Failed to fetch Post" };
    }
};
const updateProduct = async (req, res) => {
    try {
        let { title, description, price, stock } = req.body
        const Product = await ProductModel.findByIdAndUpdate(req.params?.id, { title, description, price, stock }, { new: true });
        return res.status(200).json({ data: Product, msg: null, status: 200 });
    }
    catch (error) {
        console.error("Error fetching Post:", error);
        return { success: false, msg: "Failed to fetch Post" };
    }
};

const deleteProduct = async (req, res) => {
    try {
        const Product = await ProductModel.findByIdAndUpdate(
            req.params?.id,
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );
        if (!Product) {
            return res.status(404).json({ msg: "Product not found", status: 404 });
        }
        return res.status(200).json({ data: Product, msg: "Product deleted successfully", status: 200 });
    }
    catch (error) {
        console.error("Error deleting Post:", error);
        return { success: false, msg: "Failed to delete Post" };
    }
};
const uploadPicture = async (req, res) => {
    try {
        let { id } = req.params;
        let image = req.file
        let url = await uploadFile(image);
        let updateProfile = await ProductModel.findByIdAndUpdate(id, { image: url }, { new: true })
        return res.status(200).json({ data: updateProfile, msg: "Product Picture Updated" })
    }
    catch (error) {
        console.log(error)
    }
}

const addReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { userId, rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ msg: "Rating must be between 1 and 5", status: 400 });
        }

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ msg: "Comment cannot be empty", status: 400 });
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: "Product not found", status: 404 });
        }

        // Add review to product
        product.reviews.push({ userId, rating, comment });

        // Calculate average rating
        const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        product.averageRating = (totalRating / product.reviews.length).toFixed(1);

        await product.save();

        return res.status(200).json({ 
            data: product, 
            msg: "Review added successfully", 
            status: 200 
        });
    } catch (error) {
        console.error("Error adding review:", error);
        return res.status(500).json({ success: false, msg: `Failed to add review ${error}` });
    }
};

const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await ProductModel.findById(productId).populate("reviews.userId", "username email");
        
        if (!product) {
            return res.status(404).json({ msg: "Product not found", status: 404 });
        }

        return res.status(200).json({ 
            data: {
                reviews: product.reviews,
                averageRating: product.averageRating,
                totalReviews: product.reviews.length
            },
            msg: "", 
            status: 200 
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ success: false, msg: "Failed to fetch reviews" });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.params;

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: "Product not found", status: 404 });
        }

        // Remove review
        product.reviews = product.reviews.filter(review => review._id.toString() !== reviewId);

        // Recalculate average rating
        if (product.reviews.length > 0) {
            const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
            product.averageRating = (totalRating / product.reviews.length).toFixed(1);
        } else {
            product.averageRating = 0;
        }

        await product.save();

        return res.status(200).json({ 
            data: product, 
            msg: "Review deleted successfully", 
            status: 200 
        });
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ success: false, msg: "Failed to delete review" });
    }
};

module.exports = { getAllProduct, createProduct, deleteProduct, updateProduct, uploadPicture, getAllProductSeller, getSingleProduct, addReview, getProductReviews, deleteReview };
