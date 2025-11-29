const { TransactionHistoryModel } = require("../models/transactionHistory.model");

const getAllHistory = async (req, res) => {
    try {
        let data = await TransactionHistoryModel.find({}).populate("userId")
        return res.status(200).json({ data: data, msg: "", status: 200 });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Server Error", status: 500 });
    }
};

const getHistoryByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = await TransactionHistoryModel.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({ data, msg: "", status: 200 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server Error", status: 500 });
    }
};




module.exports = { getAllHistory ,getHistoryByUser}
