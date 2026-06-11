import { useState } from "react";
import { motion } from "framer-motion";

const WORD_IDEAS = [
  "haunted library", "angry penguin", "flying pizza", "sad robot",
  "invisible friend", "dancing cactus", "moon picnic", "time machine",
  "crying cloud", "sleeping dragon", "tiny elephant", "broken umbrella",
  "jealous cat", "underwater concert", "confused astronaut"
];

export default function HostScreen({ onSubmit, round, totalRounds }) {
  const [word, setWord] = useState("");
  const [hints, setHints] = useState([]);
  const [loadingHints, setLoadingHints] = useState(false);

  const randomWord = () => {
    const w = WORD_IDEAS[Math.floor(Math.random() * WORD_IDEAS.length)];
    setWord(w);
    setHints([]);
  };

  const generateHints = async () => {
    if (!word.trim()) return;
    setLoadingHints(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:4000"}/generate-hints`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: word.trim() })
        }
      );
      const data = await res.json();
      setHints(data.hints || []);
    } catch (e) {
      setHints(["Think about its purpose", "Where would you find this?", "What does it remind you of?"]);
    }
    setLoadingHints(false);
  };

  const handleSubmit = () => {
    if (!word.trim()) return;
    onSubmit(word.trim(), hints);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ background: "white", border: "3px solid #1a1a1a", borderRadius: "24px", boxShadow: "8px 8px 0 #1a1a1a", padding: "36px", maxWidth: "400px", width: "90%", textAlign: "center" }}
      >
        <div style={{ display: "inline-block", background: "#FFD93D", border: "2px solid #1a1a1a", borderRadius: "8px", padding: "4px 12px", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", marginBottom: "12px" }}>
          ROUND {round} / {totalRounds}
        </div>
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>👑</div>
        <h3 style={{ fontWeight: 900, fontSize: "20px", color: "#1a1a1a", margin: "0 0 4px 0" }}>You're the Host!</h3>
        <p style={{ color: "#888", fontSize: "13px", marginBottom: "24px" }}>
          Give a secret word. Others will draw it based on your hints.
        </p>

        <input
          type="text"
          placeholder="enter a word or phrase..."
          value={word}
          onChange={e => { setWord(e.target.value); setHints([]); }}
          style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "2px solid #1a1a1a", fontSize: "14px", outline: "none", boxSizing: "border-box", boxShadow: "3px 3px 0 #1a1a1a", marginBottom: "10px" }}
        />

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <motion.button
            whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={randomWord}
            style={{ flex: 1, padding: "9px", borderRadius: "10px", border: "2px solid #1a1a1a", background: "#fdf6ec", fontWeight: 700, fontSize: "12px", cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a" }}
          >
            Random Word
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={generateHints}
            disabled={!word.trim() || loadingHints}
            style={{ flex: 1, padding: "9px", borderRadius: "10px", border: "2px solid #1a1a1a", background: loadingHints ? "#e5e7eb" : "#C77DFF", color: loadingHints ? "#999" : "white", fontWeight: 700, fontSize: "12px", cursor: word.trim() && !loadingHints ? "pointer" : "not-allowed", boxShadow: "2px 2px 0 #1a1a1a" }}
          >
            {loadingHints ? "Generating..." : "AI Hints"}
          </motion.button>
        </div>

        {hints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "#fdf6ec", border: "2px dashed #d4c5a9", borderRadius: "12px", padding: "14px", marginBottom: "16px", textAlign: "left" }}
          >
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#888", marginBottom: "8px", letterSpacing: "1px" }}>HINTS FOR DRAWERS:</p>
            {hints.map((h, i) => (
              <div key={i} style={{ fontSize: "13px", color: "#374151", marginBottom: "4px" }}>
                {["💡", "🌀", "✨"][i]} {h}
              </div>
            ))}
          </motion.div>
        )}

        <motion.button
          whileHover={{ y: -2, boxShadow: "6px 8px 0 #1a1a1a" }}
          whileTap={{ y: 2, boxShadow: "2px 2px 0 #1a1a1a" }}
          onClick={handleSubmit}
          disabled={!word.trim()}
          style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "2px solid #1a1a1a", background: word.trim() ? "#FF6B6B" : "#e5e7eb", color: word.trim() ? "white" : "#999", fontWeight: 800, fontSize: "14px", cursor: word.trim() ? "pointer" : "not-allowed", boxShadow: word.trim() ? "4px 4px 0 #1a1a1a" : "none" }}
        >
          Send Word to Drawers →
        </motion.button>
      </motion.div>
    </div>
  );
}