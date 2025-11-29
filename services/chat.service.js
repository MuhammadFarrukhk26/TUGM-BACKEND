const { emitToUser } = require("../config/socket.config");
const { ChatModel } = require("../models/chat.model");
const mongoose = require("mongoose");

// ✅ Create Chat
const createChat = async (req, res) => {
    try {
        const { userId1, userId2 } = req.body;
        if (!userId1 || !userId2) return res.status(400).json({ msg: "Missing user ids" });

        let chat = await ChatModel.findOne({ participants: { $all: [userId1, userId2] } })
            .populate("participants", "username profile");

        if (chat) return res.status(200).json({ data: chat, msg: "Chat exists" });

        chat = await ChatModel.create({ participants: [userId1, userId2] });
        chat = await ChatModel.findById(chat._id).populate("participants", "username profile");

        return res.status(200).json({ data: chat, msg: "Chat created" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error", error });
    }
};

// ✅ Fetch messages of a chat
const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await ChatModel.findById(chatId)
            .populate("messages.sender", "username profile");

        if (!chat) return res.status(404).json({ msg: "Chat not found" });

        return res.status(200).json({ data: chat.messages, chat, msg: "Messages fetched" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
    }
};

// ✅ Send message in a chat
const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { senderId, text } = req.body;
        if (!text || !senderId) return res.status(400).json({ msg: "Missing fields" });

        const chat = await ChatModel.findById(chatId);
        if (!chat) return res.status(404).json({ msg: "Chat not found" });

        const message = {
            sender: new mongoose.Types.ObjectId(senderId),
            text,
            createdAt: new Date(),
        };

        chat.messages.push(message);
        chat.lastMessage = text;
        await chat.save();

        const populated = await ChatModel.findById(chatId)
            .populate("messages.sender", "username profile");

            console.log('newMessage')

        emitToUser(chatId.toString(), "newMessage", populated.messages[populated.messages.length - 1]);

        return res.status(200).json({ data: populated.messages[populated.messages.length - 1], msg: "Message sent" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error", error });
    }
};

// ✅ New API: Fetch all chats for a user
const getUserChats = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ msg: "Missing user id" });

        const chats = await ChatModel.find({ participants: userId })
            .populate("participants", "username profile")
            .sort({ updatedAt: -1 }); // latest first

        return res.status(200).json({ data: chats, msg: "User chats fetched" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error", error });
    }
};

module.exports = { createChat, getChatMessages, sendMessage, getUserChats };
