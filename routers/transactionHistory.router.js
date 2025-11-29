const {getAllHistory, getHistoryByUser} = require("../services/transactionHistory.service")
const router = require("express").Router()

router.get("/all",getAllHistory)
router.get("/user/:userId", getHistoryByUser);

module.exports = router
