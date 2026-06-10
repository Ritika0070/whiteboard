import { useState } from "react";
import { motion } from "framer-motion";

export default function JoinScreen({ onJoin }) {
  const [name, setName] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "24px", padding: "40px", width: "100%", maxWidth: "380px", textAlign: "center" }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: "40px", marginBottom: "16px" }}
        >
          ✏️
        </motion.div>
        <h2 style={{ color: "white", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Join the Room</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", marginBottom: "24px" }}>Enter your name to start drawing</p>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && name.trim() && onJoin(name.trim())}
          autoFocus
          style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: "14px", outline: "none", marginBottom: "12px", boxSizing: "border-box" }}
        />
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => name.trim() && onJoin(name.trim())}
          style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #FF6B6B, #C77DFF)", color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
        >
          Start Drawing
        </motion.button>
      </motion.div>
    </div>
  );
}