const router = require("express").Router();
const {
  createAuction,
  getAuctionsByStream,
  getAuctionById,
  endAuction,
  placeBid,
  getAuctionBids,
} = require("../services/auction.service");

router.post("/create", createAuction);
router.get("/stream/:streamId", getAuctionsByStream);
router.get("/:auctionId/bids", getAuctionBids);
router.get("/:id", getAuctionById);
router.put("/end/:id", endAuction);
router.post("/bid", placeBid);

module.exports = router;
