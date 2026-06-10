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
  roomId: String, x0: Number, y0: Number, x1: Number, y1: Number,
  color: String, brushSize: Number, tool: String, userName: String,
});
const Stroke = mongoose.model("Stroke", strokeSchema);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://whiteboard-two-alpha.vercel.app"],
    methods: ["GET", "POST"],
  },
});

// Game state per room
const gameRooms = {};

function getOrCreateGame(roomId) {
  if (!gameRooms[roomId]) {
    gameRooms[roomId] = {
      active: false, phase: "idle",
      totalRounds: 3, currentRound: 0,
      players: [], scores: {}, hostIndex: 0,
      word: null, canvasImages: {},
      votes: {},
    };
  }
  return gameRooms[roomId];
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", async ({ roomId, userName }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userName = userName;

    const roomSockets = await io.in(roomId).fetchSockets();
    const users = roomSockets.map(s => s.data.userName);
    io.to(roomId).emit("online-users", users);

    const strokes = await Stroke.find({ roomId });
    socket.emit("load-strokes", strokes);

    // Send current game state if game is active
    const game = getOrCreateGame(roomId);
    if (game.active) socket.emit("game-state", game);
  });

  socket.on("draw", async (data) => {
    socket.to(data.roomId).emit("draw", data);
    await Stroke.create(data);
  });

  socket.on("cursor-move", (data) => {
    socket.to(data.roomId).emit("cursor-move", {
      id: socket.id, x: data.x, y: data.y, name: data.name,
    });
  });

  socket.on("clear", async (roomId) => {
    socket.to(roomId).emit("clear");
    await Stroke.deleteMany({ roomId });
  });

  socket.on("chat-message", (data) => {
    io.to(data.roomId).emit("chat-message", {
      name: data.name, message: data.message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  });

  // ── GAME EVENTS ──────────────────────────────────────────────

  socket.on("game-setup", ({ roomId, totalRounds }) => {
    const game = getOrCreateGame(roomId);
    game.totalRounds = totalRounds;
    game.active = true;
    game.phase = "host-turn";
    game.currentRound = 1;
    game.scores = {};
    game.hostIndex = 0;
    // set players from current room sockets
    const roomSockets = [...(io.sockets.adapter.rooms.get(roomId) || [])];
    game.players = roomSockets.map(id => {
      const s = io.sockets.sockets.get(id);
      return s?.data?.userName || "Unknown";
    }).filter(Boolean);
    game.players.forEach(p => { game.scores[p] = 0; });
    io.to(roomId).emit("game-state", { ...game, word: null });
  });

  socket.on("game-set-word", ({ roomId, word }) => {
    const game = getOrCreateGame(roomId);
    game.word = word;
    game.phase = "drawing";
    game.canvasImages = {};
    game.votes = {};
    // Send word only to host, phase to all
    const hostName = game.players[game.hostIndex % game.players.length];
    io.to(roomId).emit("game-phase", { phase: "drawing" });
    // Tell host their word is confirmed
    socket.emit("game-word-confirmed", { word });
  });

  socket.on("game-submit-canvas", ({ roomId, userName, imageData }) => {
    const game = getOrCreateGame(roomId);
    game.canvasImages[userName] = imageData;
    const drawers = game.players.filter(
      p => p !== game.players[game.hostIndex % game.players.length]
    );
    if (Object.keys(game.canvasImages).length >= drawers.length) {
      game.phase = "reveal";
      // Send anonymous images — shuffle so order doesn't reveal who drew
      const entries = Object.entries(game.canvasImages);
      const shuffled = entries.sort(() => Math.random() - 0.5);
      const anonymous = shuffled.map(([, img], i) => ({ id: i, image: img }));
      io.to(roomId).emit("game-reveal", { anonymous, word: game.word });
    }
  });

  socket.on("game-vote", ({ roomId, voterName, winnerId, winnerIndex }) => {
    const game = getOrCreateGame(roomId);
    if (game.votes[voterName]) return; // already voted
    game.votes[voterName] = winnerIndex;

    const entries = Object.entries(game.canvasImages);
    const shuffled = entries.sort(() => Math.random() - 0.5);
    // Count votes per index
    const voteCounts = {};
    Object.values(game.votes).forEach(idx => {
      voteCounts[idx] = (voteCounts[idx] || 0) + 1;
    });

    const totalVoters = game.players.length; // everyone can vote except host
    if (Object.keys(game.votes).length >= totalVoters - 1) {
      // Find winner by most votes
      let maxVotes = 0, winnerName = null;
      Object.entries(voteCounts).forEach(([idx, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          winnerName = shuffled[parseInt(idx)]?.[0];
        }
      });
      if (winnerName) game.scores[winnerName] = (game.scores[winnerName] || 0) + 1;

      game.phase = "scoring";
      io.to(roomId).emit("game-round-end", {
        scores: game.scores,
        roundWinner: winnerName,
        round: game.currentRound,
        totalRounds: game.totalRounds,
      });

      // Advance round
      game.currentRound++;
      game.hostIndex++;
      game.word = null;

      if (game.currentRound > game.totalRounds) {
        game.active = false;
        game.phase = "game-over";
        const overallWinner = Object.entries(game.scores).sort((a, b) => b[1] - a[1])[0]?.[0];
        setTimeout(() => io.to(roomId).emit("game-over", { scores: game.scores, winner: overallWinner }), 3000);
      } else {
        setTimeout(() => {
          game.phase = "host-turn";
          io.to(roomId).emit("game-next-round", {
            round: game.currentRound,
            hostIndex: game.hostIndex % game.players.length,
            players: game.players,
          });
        }, 3000);
      }
    }
  });

  socket.on("game-end", ({ roomId }) => {
    const game = getOrCreateGame(roomId);
    game.active = false;
    game.phase = "idle";
    io.to(roomId).emit("game-ended");
  });

  // ─────────────────────────────────────────────────────────────

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      socket.to(roomId).emit("user-left", socket.id);
      setTimeout(async () => {
        const roomSockets = await io.in(roomId).fetchSockets();
        const users = roomSockets.map(s => s.data.userName);
        io.to(roomId).emit("online-users", users);
      }, 500);
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));