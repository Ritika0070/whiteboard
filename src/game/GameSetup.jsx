import { useState } from "react";
import { motion } from "framer-motion";

export default function GameSetup({ onStart, onCancel, playerCount }) {
  const [rounds, setRounds] = useState(3);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ background: "white", border: "3px solid #1a1a1a", borderRadius: "24px", boxShadow: "8px 8px 0 #1a1a1a", padding: "40px 36px", maxWidth: "380px", width: "90%", textAlign: "center" }}
      >
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎨</div>
        <h2 style={{ fontSize: "26px", fontWeight: 900, color: "#1a1a1a", margin: "0 0 8px 0" }}>Doodle Wars!</h2>
        <p style={{ color: "#888", fontSize: "13px", marginBottom: "28px", fontStyle: "italic" }}>
          Host gives a word → others draw privately → everyone votes → best drawing wins!
        </p>

        <p style={{ fontWeight: 700, color: "#1a1a1a", marginBottom: "12px" }}>How many rounds?</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "28px" }}>
          {[3, 4, 5].map(r => (
            <motion.button
              key={r}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRounds(r)}
              style={{
                width: "60px", height: "60px", borderRadius: "12px", border: "2px solid #1a1a1a",
                background: rounds === r ? "#FF6B6B" : "#fdf6ec",
                color: rounds === r ? "white" : "#1a1a1a",
                fontWeight: 800, fontSize: "20px", cursor: "pointer",
                boxShadow: rounds === r ? "4px 4px 0 #1a1a1a" : "2px 2px 0 #1a1a1a"
              }}
            >
              {r}
            </motion.button>
          ))}
        </div>

        <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "20px" }}>
          {playerCount} players · {rounds} rounds · each player gets 1 host turn
        </p>

        <div style={{ display: "flex", gap: "10px" }}>
          <motion.button
            whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => onStart(rounds)}
            style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "2px solid #1a1a1a", background: "#6BCB77", color: "white", fontWeight: 800, fontSize: "14px", cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a" }}
          >
            Start Game!
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            style={{ padding: "13px 16px", borderRadius: "12px", border: "2px solid #1a1a1a", background: "#fdf6ec", color: "#888", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a" }}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}