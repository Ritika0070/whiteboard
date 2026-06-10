import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Wobbly SVG doodle shapes
function Cloud({ x, y, size = 1 }) {
  return (
    <motion.svg
      style={{ position: "absolute", left: x, top: y, opacity: 0.85 }}
      width={120 * size} height={70 * size} viewBox="0 0 120 70"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <ellipse cx="60" cy="45" rx="50" ry="25" fill="#fff" stroke="#d4c5a9" strokeWidth="2" strokeDasharray="4 2" />
      <ellipse cx="40" cy="35" rx="28" ry="22" fill="#fff" stroke="#d4c5a9" strokeWidth="2" strokeDasharray="4 2" />
      <ellipse cx="75" cy="32" rx="24" ry="20" fill="#fff" stroke="#d4c5a9" strokeWidth="2" strokeDasharray="4 2" />
    </motion.svg>
  );
}

function Star({ x, y, color }) {
  return (
    <motion.svg style={{ position: "absolute", left: x, top: y }} width="24" height="24" viewBox="0 0 24 24"
      animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
      transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
    >
      <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill={color} stroke={color} strokeWidth="1" opacity="0.8" />
    </motion.svg>
  );
}

function Pencil({ x, y, rotate = 0 }) {
  return (
    <motion.svg style={{ position: "absolute", left: x, top: y }} width="48" height="48" viewBox="0 0 48 48"
      animate={{ rotate: [rotate, rotate + 8, rotate - 8, rotate] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <rect x="10" y="4" width="12" height="36" rx="2" fill="#FFD93D" stroke="#c8a200" strokeWidth="1.5" />
      <polygon points="10,40 22,40 16,48" fill="#f4a261" stroke="#c8a200" strokeWidth="1" />
      <rect x="10" y="4" width="12" height="7" rx="2" fill="#ff6b6b" stroke="#c8a200" strokeWidth="1.5" />
      <rect x="10" y="36" width="12" height="4" fill="#ffe0b2" stroke="#c8a200" strokeWidth="1" />
    </motion.svg>
  );
}

function Crayon({ x, y, color, rotate = 0 }) {
  return (
    <motion.svg style={{ position: "absolute", left: x, top: y }} width="40" height="40" viewBox="0 0 40 40"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
      initial={{ rotate }}
    >
      <rect x="12" y="6" width="10" height="26" rx="2" fill={color} stroke="#00000022" strokeWidth="1.5" />
      <polygon points="12,32 22,32 17,40" fill={color} stroke="#00000022" strokeWidth="1" />
      <rect x="12" y="6" width="10" height="6" rx="2" fill="white" opacity="0.4" />
    </motion.svg>
  );
}

function WobblyCircle({ x, y, color, size }) {
  return (
    <motion.svg style={{ position: "absolute", left: x, top: y, opacity: 0.25 }} width={size} height={size} viewBox="0 0 100 100"
      animate={{ scale: [1, 1.08, 1], rotate: [0, 10, 0] }}
      transition={{ duration: 5, repeat: Infinity }}
    >
      <ellipse cx="50" cy="50" rx="45" ry="40" fill={color} />
    </motion.svg>
  );
}

function DoodleLine({ x, y, width, color, rotate = 0 }) {
  return (
    <motion.svg style={{ position: "absolute", left: x, top: y, transform: `rotate(${rotate}deg)`, opacity: 0.6 }} width={width} height="12" viewBox={`0 0 ${width} 12`}>
      <path d={`M 0 6 Q ${width / 4} 2 ${width / 2} 6 Q ${(width * 3) / 4} 10 ${width} 6`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </motion.svg>
  );
}

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [mode, setMode] = useState(null);
  const navigate = useNavigate();

  const handleCreate = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    if (userName.trim()) navigate(`/room/${id}`);
  };

  const handleJoin = () => {
    if (roomId.trim() && userName.trim()) navigate(`/room/${roomId.trim()}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf6ec", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", fontFamily: "'Segoe UI', Comic Sans MS, cursive" }}>

      {/* Background blobs */}
      <WobblyCircle x="-60px" y="-60px" color="#FFD93D" size={300} />
      <WobblyCircle x="70%" y="60%" color="#FF6B6B" size={260} />
      <WobblyCircle x="60%" y="-40px" color="#6BCB77" size={200} />
      <WobblyCircle x="-20px" y="60%" color="#4D96FF" size={220} />

      {/* Clouds */}
      <Cloud x="5%" y="8%" size={1.2} />
      <Cloud x="60%" y="5%" size={0.9} />
      <Cloud x="75%" y="55%" size={0.8} />

      {/* Stars */}
      <Star x="15%" y="15%" color="#FFD93D" />
      <Star x="80%" y="20%" color="#FF6B6B" />
      <Star x="10%" y="70%" color="#6BCB77" />
      <Star x="88%" y="75%" color="#4D96FF" />
      <Star x="50%" y="90%" color="#C77DFF" />

      {/* Pencils & Crayons */}
      <Pencil x="3%" y="40%" rotate={-20} />
      <Pencil x="88%" y="35%" rotate={15} />
      <Crayon x="20%" y="82%" color="#FF6B6B" rotate={10} />
      <Crayon x="72%" y="78%" color="#4D96FF" rotate={-15} />
      <Crayon x="45%" y="5%" color="#C77DFF" rotate={5} />

      {/* Doodle lines */}
      <DoodleLine x="5%" y="30%" width={80} color="#FFD93D" rotate={-10} />
      <DoodleLine x="75%" y="40%" width={70} color="#FF6B6B" rotate={12} />
      <DoodleLine x="30%" y="88%" width={90} color="#6BCB77" rotate={-5} />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{
          position: "relative", zIndex: 10,
          background: "white",
          border: "3px solid #1a1a1a",
          borderRadius: "24px",
          boxShadow: "6px 6px 0px #1a1a1a",
          padding: "40px 36px",
          width: "100%", maxWidth: "420px",
          textAlign: "center",
        }}
      >
        {/* Title */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
        >
          <div style={{ display: "inline-block", background: "#FFD93D", border: "2px solid #1a1a1a", borderRadius: "12px", padding: "6px 16px", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", marginBottom: "12px", boxShadow: "3px 3px 0 #1a1a1a" }}>
            LET'S DRAW TOGETHER
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: "42px", fontWeight: 900, color: "#1a1a1a", margin: "0 0 4px 0", lineHeight: 1.1, letterSpacing: "-1px" }}
        >
          Scribble
          <span style={{ color: "#FF6B6B" }}>!</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ color: "#888", fontSize: "14px", marginBottom: "28px", fontStyle: "italic" }}
        >
          draw, doodle & vibe with friends ✨
        </motion.p>

        {/* Wavy underline */}
        <DoodleLine x="25%" y="-8px" width={200} color="#FFD93D" />

        {/* Name input */}
        <motion.input
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          type="text"
          placeholder="your name..."
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "2px solid #1a1a1a", background: "#fdf6ec", fontSize: "14px", outline: "none", marginBottom: "16px", boxSizing: "border-box", fontFamily: "inherit", boxShadow: "3px 3px 0 #1a1a1a" }}
        />

        {!mode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ display: "flex", gap: "12px" }}>
            <motion.button
              whileHover={{ y: -3, boxShadow: "6px 8px 0 #1a1a1a" }}
              whileTap={{ y: 2, boxShadow: "2px 2px 0 #1a1a1a" }}
              onClick={() => setMode("create")}
              style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "2px solid #1a1a1a", background: "#FF6B6B", color: "white", fontWeight: 800, fontSize: "14px", cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a", fontFamily: "inherit" }}
            >
              Create Room
            </motion.button>
            <motion.button
              whileHover={{ y: -3, boxShadow: "6px 8px 0 #1a1a1a" }}
              whileTap={{ y: 2, boxShadow: "2px 2px 0 #1a1a1a" }}
              onClick={() => setMode("join")}
              style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "2px solid #1a1a1a", background: "#4D96FF", color: "white", fontWeight: 800, fontSize: "14px", cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a", fontFamily: "inherit" }}
            >
              Join Room
            </motion.button>
          </motion.div>
        )}

        {mode === "create" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ color: "#aaa", fontSize: "13px", margin: "0 0 4px 0", fontStyle: "italic" }}>a random room ID will be created for you</p>
            <motion.button
              whileHover={{ y: -3, boxShadow: "6px 8px 0 #1a1a1a" }}
              whileTap={{ y: 2, boxShadow: "2px 2px 0 #1a1a1a" }}
              onClick={handleCreate}
              style={{ padding: "13px", borderRadius: "12px", border: "2px solid #1a1a1a", background: "#6BCB77", color: "white", fontWeight: 800, fontSize: "14px", cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a", fontFamily: "inherit" }}
            >
              Let's Go!
            </motion.button>
            <button onClick={() => setMode(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>← Back</button>
          </motion.div>
        )}

        {mode === "join" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              type="text"
              placeholder="enter room ID..."
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "2px solid #1a1a1a", background: "#fdf6ec", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", boxShadow: "3px 3px 0 #1a1a1a" }}
            />
            <motion.button
              whileHover={{ y: -3, boxShadow: "6px 8px 0 #1a1a1a" }}
              whileTap={{ y: 2, boxShadow: "2px 2px 0 #1a1a1a" }}
              onClick={handleJoin}
              style={{ padding: "13px", borderRadius: "12px", border: "2px solid #1a1a1a", background: "#C77DFF", color: "white", fontWeight: 800, fontSize: "14px", cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a", fontFamily: "inherit" }}
            >
              Join Room
            </motion.button>
            <button onClick={() => setMode(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>← Back</button>
          </motion.div>
        )}

        {/* Color dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
          {["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C77DFF", "#FF9A3C"].map((c, i) => (
            <motion.div key={i} style={{ width: "12px", height: "12px", borderRadius: "50%", background: c, border: "2px solid #1a1a1a" }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}