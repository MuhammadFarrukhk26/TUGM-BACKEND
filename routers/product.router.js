const { multipleupload } = require("../config/multer.config")
const {createProduct, getAllProduct, getAllProductSeller, updateProduct, deleteProduct, uploadPicture, getSingleProduct, addReview, getProductReviews, deleteReview } = require("../services/product.service")
const router = require("express").Router()

router.post("/create",multipleupload.array("images", 5),createProduct)
router.get("/all",getAllProduct)
router.get("/user/:id",getAllProductSeller)
router.get("/single/:id",getSingleProduct)
router.put("/update/:id",updateProduct)
router.put("/update/image/:id",multipleupload.single("image"),uploadPicture)
router.delete("/del/:id",deleteProduct)
router.post("/review/:productId",addReview)
router.get("/reviews/:productId",getProductReviews)
router.delete("/review/:productId/:reviewId",deleteReview)

module.exports = router