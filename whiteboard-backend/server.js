require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.log("MongoDB error:", err));

// Drawing schema
const strokeSchema = new mongoose.Schema({
  roomId: String,
  x0: Number,
  y0: Number,
  x1: Number,
  y1: Number,
  color: String,
  brushSize: Number,
  tool: String,
});

const Stroke = mongoose.model("Stroke", strokeSchema);

const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
// });
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://whiteboard-two-alpha.vercel.app"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Purani drawings bhejo naye user ko
    const strokes = await Stroke.find({ roomId });
    socket.emit("load-strokes", strokes);
  });

  socket.on("draw", async (data) => {
    socket.to(data.roomId).emit("draw", data);

    // MongoDB mein save karo
    await Stroke.create(data);
  });

  socket.on("clear", async (roomId) => {
    socket.to(roomId).emit("clear");

    // MongoDB se delete karo
    await Stroke.deleteMany({ roomId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});