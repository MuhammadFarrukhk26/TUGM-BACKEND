const { createOrder, getOrderForSeller, getOrderForUser, getSingleOrder, markAsDelivered, changeStatus, cancelOrder, printLabel } = require("../services/order.service")

const router = require("express").Router()

router.post("/checkout", createOrder)
router.get("/:id", getSingleOrder)
router.get("/user/:id", getOrderForUser)
router.get("/seller/:id", getOrderForSeller)
router.post("/cancel/:id", cancelOrder)
router.get("/delivered/:id", markAsDelivered)
router.put("/status/:id", changeStatus)
router.post("/print/:id", printLabel)

module.exports = router