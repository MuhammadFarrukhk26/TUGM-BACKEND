const router = require("express").Router();
const {
    createShipment,
    getSellerShipments,
    getBuyerShipments,
    getSingleShipment,
    updateShipmentStatus,
    cancelShipment,
} = require("../services/shipment.service");

// CREATE SHIPMENT (Called when auction completes or order is placed)
router.post("/create", createShipment);

// GET SHIPMENTS FOR SELLER
router.get("/seller/:sellerId", getSellerShipments);

// GET SHIPMENTS FOR BUYER
router.get("/buyer/:bidderId", getBuyerShipments);

// UPDATE SHIPMENT STATUS
router.put("/:shipmentId/status", updateShipmentStatus);

// GET SINGLE SHIPMENT
router.get("/:shipmentId", getSingleShipment);

// CANCEL SHIPMENT
router.delete("/:shipmentId", cancelShipment);

module.exports = router;