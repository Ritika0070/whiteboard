import { motion } from "framer-motion";

export default function DrawingPhase({ hints, timer, onTimeUp, isHost, word, totalPlayers, submittedCount }) {
  if (isHost) {
    return (
      <div style={{ position: "fixed", top: "70px", left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ background: "white", border: "2px solid #1a1a1a", borderRadius: "16px", boxShadow: "4px 4px 0 #1a1a1a", padding: "14px 24px", textAlign: "center" }}
        >
          <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Your word:</p>
          <p style={{ fontSize: "18px", fontWeight: 900, color: "#FF6B6B" }}>"{word}"</p>
          <p style={{ fontSize: "12px", color: "#aaa" }}>Waiting for {totalPlayers - 1} players to draw... ({submittedCount}/{totalPlayers - 1} done)</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", top: "70px", left: "50%", transform: "translateX(-50%)", zIndex: 50, minWidth: "320px" }}>
      <motion.div
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ background: "white", border: "2px solid #1a1a1a", borderRadius: "16px", boxShadow: "4px 4px 0 #1a1a1a", padding: "14px 24px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#888", marginBottom: "6px", letterSpacing: "1px" }}>HINTS:</p>
            {hints.map((h, i) => (
              <p key={i} style={{ fontSize: "13px", color: "#374151", margin: "2px 0" }}>
                {["💡", "🌀", "✨"][i]} {h}
              </p>
            ))}
          </div>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <motion.div
              animate={{ scale: timer <= 10 ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.5, repeat: timer <= 10 ? Infinity : 0 }}
              style={{ fontSize: "32px", fontWeight: 900, color: timer <= 10 ? "#ef4444" : "#1a1a1a", lineHeight: 1 }}
            >
              {timer}
            </motion.div>
            <p style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>seconds</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}