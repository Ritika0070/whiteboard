import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C77DFF", "#FF9A3C"];

function FloatingBlob({ x, y, color, size }) {
  return (
    <motion.div
      style={{
        position: "absolute", left: x, top: y,
        width: size, height: size, borderRadius: "50%",
        background: color, opacity: 0.18, filter: "blur(40px)",
        zIndex: 0,
      }}
      animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
      transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function DoodleStroke({ x, y, rotate, color }) {
  return (
    <motion.div
      style={{
        position: "absolute", left: x, top: y,
        width: "60px", height: "6px", borderRadius: "99px",
        background: color, opacity: 0.5, rotate,
        zIndex: 0,
      }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [mode, setMode] = useState(null);
  const navigate = useNavigate();

  const handleCreate = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    if (userName.trim()) navigate(`/room/${id}`, { state: { userName } });
  };

  const handleJoin = () => {
    if (roomId.trim() && userName.trim()) navigate(`/room/${roomId.trim()}`, { state: { userName } });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Background blobs */}
      <FloatingBlob x="5%" y="10%" color="#FF6B6B" size="300px" />
      <FloatingBlob x="70%" y="5%" color="#4D96FF" size="250px" />
      <FloatingBlob x="80%" y="60%" color="#C77DFF" size="350px" />
      <FloatingBlob x="10%" y="65%" color="#6BCB77" size="200px" />
      <FloatingBlob x="45%" y="80%" color="#FFD93D" size="220px" />

      {/* Doodle strokes */}
      <DoodleStroke x="8%" y="20%" rotate="-15deg" color="#FF6B6B" />
      <DoodleStroke x="75%" y="15%" rotate="20deg" color="#FFD93D" />
      <DoodleStroke x="85%" y="50%" rotate="-30deg" color="#C77DFF" />
      <DoodleStroke x="5%" y="75%" rotate="10deg" color="#6BCB77" />
      <DoodleStroke x="55%" y="88%" rotate="-20deg" color="#4D96FF" />
      <DoodleStroke x="30%" y="12%" rotate="25deg" color="#FF9A3C" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ position: "relative", zIndex: 10, background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "28px", padding: "48px 40px", width: "100%", maxWidth: "440px", textAlign: "center" }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "18px", background: "linear-gradient(135deg, #FF6B6B, #C77DFF)", marginBottom: "16px", fontSize: "28px" }}
        >
          ✏️
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: "32px", fontWeight: 800, color: "white", margin: "0 0 8px 0", letterSpacing: "-0.5px" }}
        >
          Scribble
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "32px" }}
        >
          Real-time collaborative drawing board
        </motion.p>

        {/* Name input always visible */}
        <motion.input
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          type="text"
          placeholder="Your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: "14px", outline: "none", marginBottom: "16px", boxSizing: "border-box" }}
        />

        {!mode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ display: "flex", gap: "12px" }}
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode("create")}
              style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #FF6B6B, #FF9A3C)", color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
            >
              Create Room
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode("join")}
              style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
            >
              Join Room
            </motion.button>
          </motion.div>
        )}

        {mode === "create" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: "0 0 4px 0" }}>A new room ID will be auto-generated</p>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={handleCreate}
              style={{ padding: "13px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #FF6B6B, #FF9A3C)", color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
            >
              Let's Go
            </motion.button>
            <button onClick={() => setMode(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "13px" }}>Back</button>
          </motion.div>
        )}

        {mode === "join" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={handleJoin}
              style={{ padding: "13px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #4D96FF, #C77DFF)", color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
            >
              Join Room
            </motion.button>
            <button onClick={() => setMode(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "13px" }}>Back</button>
          </motion.div>
        )}

        {/* Color dots decoration */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "28px" }}>
          {COLORS.map((c, i) => (
            <motion.div
              key={i}
              style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>

      </motion.div>
    </div>
  );
}