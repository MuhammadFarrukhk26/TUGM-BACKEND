let ioInstance;

const setupSocket = (io) => {
    ioInstance = io;
console.log("Socket.io setup complete. Listening for connections...", io, ioInstance);
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        socket.on("join", (data) => {
            let streamId;
            try {
                const parsedData = typeof data === "string" && data.includes("{") ? JSON.parse(data) : { streamId: data };
                streamId = parsedData.streamId;
            } catch (e) {
                console.error("Failed to parse join data:", e);
                return;
            }

            if (streamId) {
                socket.join(String(streamId));
                console.log(`User ${streamId} joined their room`);
            } else {
                console.log(
                    "Received 'join' event but streamId was undefined or missing."
                );
            }
        });
        socket.on("sendPerk", (data) => {
            console.log(data.streamId, 'data of sendPerk')
            io.to(data.streamId).emit("newPerk", data);
        });
        socket.on("sendMessage", (payload) => {
            try {
                const streamId = payload?.streamId;

                if (!streamId) return;

                io.to(String(streamId)).emit("newMessage", payload);
            } catch (e) {
                console.error("sendMessage error:", e);
            }
        });
        socket.on("sendGift", (payload) => {
            try {
                const streamId = payload && (payload.streamId || payload.room);
                if (!streamId) return;
                io.to(String(streamId)).emit("newGift", payload);
            } catch (e) {
                console.error("sendGift handler error:", e);
            }
        });

        socket.on("sendBid", (payload) => {
            try {
                const streamId = payload && (payload.streamId || payload.room);
                if (!streamId) return;
                io.to(String(streamId)).emit("newBid", payload);
            } catch (e) {
                console.error("sendBid handler error:", e);
            }
        });
        socket.on("extendBiddingTime", (data) => {
            try {
                const streamId = data && (data.streamId || data.room);
                if (!streamId) return;
                io.to(String(streamId)).emit("auctionTimeExtended", {
                    newEndTime: data.newEndTime,
                    extensionReason: data.extensionReason,
                });
            } catch (e) {
                console.error("extendBiddingTime handler error:", e);
            }
        });

        socket.on("sendAuctionWinner", (data) => {
            try {
                const streamId = data && (data.streamId || data.room);
                if (!streamId) return;
                io.to(String(streamId)).emit("auctionWinner", data);
            } catch (e) {
                console.error("sendAuctionWinner handler error:", e);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

const emitToUser = (streamId, event, data) => {
    console.log(`🚀 Emitting event "${event}" to room: ${streamId}`);
    if (ioInstance) ioInstance.to(streamId).emit(event, data);
};


module.exports = { setupSocket, emitToUser };
// let ioInstance;

// const setupSocket = (io) => {
//     ioInstance = io;
// console.log("Socket.io setup complete. Listening for connections...", io, ioInstance);
//     io.on("connection", (socket) => {
//         console.log("User connected:", socket.id);
//         socket.on("join", (data) => {
//             let streamId;
//             try {
//                 const parsedData = typeof data === "string" && data.includes("{") ? JSON.parse(data) : { streamId: data };
//                 streamId = parsedData.streamId;
//             } catch (e) {
//                 console.error("Failed to parse join data:", e);
//                 return;
//             }

//             if (streamId) {
//                 socket.join(streamId.streamId);
//                 console.log(`User ${streamId.streamId} joined their room`);
//             } else {
//                 console.log(
//                     "Received 'join' event but streamId was undefined or missing."
//                 );
//             }
//         });
//         socket.on("sendPerk", (data) => {
//             console.log(data.streamId, 'data of sendPerk')
//             io.to(data.streamId).emit("newPerk", data);
//         });
//         socket.on("sendMessage", (payload) => {
//             try {
//                 const streamId = payload?.streamId;

//                 if (!streamId) return;

//                 io.to(String(streamId)).emit("newMessage", payload);
//             } catch (e) {
//                 console.error("sendMessage error:", e);
//             }
//         });
//         socket.on("sendGift", (payload) => {
//             try {
//                 const streamId = payload && (payload.streamId || payload.room);
//                 if (!streamId) return;
//                 io.to(String(streamId)).emit("newGift", payload);
//             } catch (e) {
//                 console.error("sendGift handler error:", e);
//             }
//         });

//         socket.on("sendBid", (payload) => {
//             try {
//                 const streamId = payload && (payload.streamId || payload.room);
//                 if (!streamId) return;
//                 io.to(String(streamId)).emit("newBid", payload);
//             } catch (e) {
//                 console.error("sendBid handler error:", e);
//             }
//         });
//         socket.on("disconnect", () => {
//             console.log("User disconnected:", socket.id);
//         });
//     });
// };

// const emitToUser = (streamId, event, data) => {
//     console.log(`🚀 Emitting event "${event}" to room: ${streamId}`);
//     if (ioInstance) ioInstance.to(streamId).emit(event, data);
// };


// module.exports = { setupSocket, emitToUser };
