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

// AI Hints endpoint using Groq
app.post("/generate-hints", async (req, res) => {
  const { word } = req.body;
  if (!word) return res.status(400).json({ error: "No word provided" });
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `Drawing game hints for: "${word}"
Generate exactly 3 hints. Each hint must be SPECIFIC to "${word}" only — not generic.
Indirect and metaphorical, max 6 words each, progressively easier.
Respond ONLY with valid JSON array, no extra text: ["hint1", "hint2", "hint3"]`
        }]
      })
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const hints = JSON.parse(clean);
    res.json({ hints });
  } catch (e) {
    console.log("Hints error:", e);
    res.status(500).json({ error: "Failed to generate hints" });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://whiteboard-two-alpha.vercel.app"],
    methods: ["GET", "POST"],
  },
});

const gameRooms = {};

function getOrCreateGame(roomId) {
  if (!gameRooms[roomId]) {
    gameRooms[roomId] = {
      active: false, phase: "idle",
      totalRounds: 3, currentRound: 0,
      players: [], scores: {}, hostIndex: 0,
      word: null, canvasImages: {}, votes: {},
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

  socket.on("game-hints", (data) => {
    socket.to(data.roomId).emit("game-hints", { hints: data.hints });
  });

  socket.on("game-setup", ({ roomId, totalRounds }) => {
    const game = getOrCreateGame(roomId);
    game.totalRounds = totalRounds;
    game.active = true;
    game.phase = "host-turn";
    game.currentRound = 1;
    game.scores = {};
    game.hostIndex = 0;
    game.canvasImages = {};
    game.votes = {};

    const roomSockets = [...(io.sockets.adapter.rooms.get(roomId) || [])];
    game.players = roomSockets.map(id => {
      const s = io.sockets.sockets.get(id);
      return s?.data?.userName || null;
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
    io.to(roomId).emit("game-phase", { phase: "drawing" });
    socket.emit("game-word-confirmed", { word });
  });

  socket.on("game-submit-canvas", ({ roomId, userName, imageData }) => {
    const game = getOrCreateGame(roomId);
    game.canvasImages[userName] = imageData;

    const hostName = game.players[game.hostIndex % game.players.length];
    const drawers = game.players.filter(p => p !== hostName);

    io.to(roomId).emit("game-canvas-submitted");

    if (Object.keys(game.canvasImages).length >= drawers.length) {
      game.phase = "reveal";
      const entries = Object.entries(game.canvasImages);
      const shuffled = entries.sort(() => Math.random() - 0.5);
      const anonymous = shuffled.map(([, img], i) => ({ id: i, image: img }));
      game.shuffledOrder = shuffled.map(([name]) => name);
      io.to(roomId).emit("game-reveal", { anonymous, word: game.word });
    }
  });

  socket.on("game-vote", ({ roomId, voterName, winnerIndex }) => {
    const game = getOrCreateGame(roomId);
    if (game.votes[voterName] !== undefined) return;
    game.votes[voterName] = winnerIndex;

    const totalVoters = game.players.length;
    const votedCount = Object.keys(game.votes).length;

    if (votedCount >= totalVoters) {
      const voteCounts = {};
      Object.values(game.votes).forEach(idx => {
        if (idx === -1) return;
        voteCounts[idx] = (voteCounts[idx] || 0) + 1;
      });

      let maxVotes = 0;
      let winnerIdx = -1;
      Object.entries(voteCounts).forEach(([idx, count]) => {
        if (count > maxVotes) { maxVotes = count; winnerIdx = parseInt(idx); }
      });

      let winnerName = null;
      if (winnerIdx >= 0 && game.shuffledOrder) {
        winnerName = game.shuffledOrder[winnerIdx];
        game.scores[winnerName] = (game.scores[winnerName] || 0) + 1;
      }

      game.phase = "scoring";
      io.to(roomId).emit("game-round-end", {
        scores: game.scores,
        roundWinner: winnerName,
        round: game.currentRound,
        totalRounds: game.totalRounds,
      });

      game.currentRound++;
      game.hostIndex++;
      game.word = null;
      game.canvasImages = {};
      game.votes = {};

      if (game.currentRound > game.totalRounds) {
        game.active = false;
        game.phase = "game-over";
        const overallWinner = Object.entries(game.scores)
          .sort((a, b) => b[1] - a[1])[0]?.[0];
        setTimeout(() => {
          io.to(roomId).emit("game-over", { scores: game.scores, winner: overallWinner });
        }, 3000);
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