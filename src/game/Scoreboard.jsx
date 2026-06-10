import { motion } from "framer-motion";

export default function Scoreboard({ scores, roundWinner, gameWinner, round, totalRounds, onNext, isHost }) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const isGameOver = !!gameWinner;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: "white", border: "3px solid #1a1a1a", borderRadius: "24px", boxShadow: "8px 8px 0 #1a1a1a", padding: "36px", maxWidth: "380px", width: "90%", textAlign: "center" }}
      >
        {isGameOver ? (
          <>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>🏆</div>
            <div style={{ display: "inline-block", background: "#FFD93D", border: "2px solid #1a1a1a", borderRadius: "8px", padding: "4px 14px", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", marginBottom: "12px" }}>GAME OVER!</div>
            <h3 style={{ fontSize: "22px", fontWeight: 900, margin: "0 0 4px 0" }}>{gameWinner} Wins! 🎉</h3>
          </>
        ) : (
          <>
            <div style={{ display: "inline-block", background: "#6BCB77", border: "2px solid #1a1a1a", borderRadius: "8px", padding: "4px 14px", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", marginBottom: "12px" }}>ROUND {round} DONE!</div>
            {roundWinner && <p style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>🎨 {roundWinner} got the most votes!</p>}
          </>
        )}

        <div style={{ margin: "20px 0", textAlign: "left" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#888", letterSpacing: "1px", marginBottom: "10px" }}>SCOREBOARD:</p>
          {sorted.map(([name, pts], i) => (
            <motion.div
              key={name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "10px", marginBottom: "6px", background: i === 0 ? "#FFF9C4" : "#f9fafb", border: "1.5px solid " + (i === 0 ? "#FFD93D" : "#e5e7eb") }}
            >
              <span style={{ fontWeight: 700, fontSize: "14px" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  "} {name}</span>
              <span style={{ fontWeight: 900, fontSize: "16px", color: "#FF6B6B" }}>{pts} pts</span>
            </motion.div>
          ))}
        </div>

        {!isGameOver && (
          <p style={{ color: "#aaa", fontSize: "13px" }}>Next round starting in 3 seconds...</p>
        )}
        {isGameOver && (
          <motion.button
            whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={onNext}
            style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "2px solid #1a1a1a", background: "#FF6B6B", color: "white", fontWeight: 800, fontSize: "14px", cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a", marginTop: "8px" }}
          >
            Back to Whiteboard
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}