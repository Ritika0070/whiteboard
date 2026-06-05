require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.log("MongoDB error:", err));

const strokeSchema = new mongoose.Schema({
  roomId: String,
  x0: Number,
  y0: Number,
  x1: Number,
  y1: Number,
  color: String,
  brushSize: Number,
  tool: String,
  userName: String,
});

const Stroke = mongoose.model("Stroke", strokeSchema);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://whiteboard-two-alpha.vercel.app"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", async ({ roomId, userName }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userName = userName;
    console.log(`${userName} joined room ${roomId}`);

    const strokes = await Stroke.find({ roomId });
    socket.emit("load-strokes", strokes);
  });

  socket.on("draw", async (data) => {
    socket.to(data.roomId).emit("draw", data);
    await Stroke.create(data);
  });

  socket.on("cursor-move", (data) => {
    socket.to(data.roomId).emit("cursor-move", {
      id: socket.id,
      x: data.x,
      y: data.y,
      name: data.name,
    });
  });

  socket.on("clear", async (roomId) => {
    socket.to(roomId).emit("clear");
    await Stroke.deleteMany({ roomId });
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      socket.to(roomId).emit("user-left", socket.id);
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});