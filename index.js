const express = require("express");
const cors = require("cors");
const http = require("http");
const cron = require("node-cron");
const dbConnection = require("./config/db.config");
const combineRouter = require("./routers/index");

const { StoryModel } = require("./models/story.model");
const { setupSocket } = require("./config/socket.config");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3002;
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT"]
    }
});

setupSocket(io);

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/api/v1", combineRouter);
dbConnection();

cron.schedule("0 * * * *", async () => {
    try {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const result = await StoryModel.updateMany({ createdAt: { $lt: twentyFourHoursAgo }, isActive: true }, { $set: { isActive: false } });

        console.log(`Deactivated ${result.modifiedCount} stories`);
    }
    catch (error) {
        console.error("Error deactivating stories:", error);
    }
});
// Start server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
