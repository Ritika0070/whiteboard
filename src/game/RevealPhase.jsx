import { motion } from "framer-motion";

export default function RevealPhase({ data, myVote, onVote, isHost, userName }) {
  if (!data) return null;
  const { anonymous, word } = data;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "16px" }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: "white", border: "3px solid #1a1a1a", borderRadius: "24px", boxShadow: "8px 8px 0 #1a1a1a", padding: "28px", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ display: "inline-block", background: "#FFD93D", border: "2px solid #1a1a1a", borderRadius: "8px", padding: "4px 14px", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", marginBottom: "8px" }}>
            REVEAL TIME!
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: 900, margin: "0 0 4px 0" }}>
            The word was: <span style={{ color: "#FF6B6B" }}>"{word}"</span>
          </h3>
          <p style={{ color: "#888", fontSize: "13px" }}>
            {myVote !== null
              ? "Vote cast! Waiting for others..."
              : isHost
              ? "Pick the best drawing — or 'None Correct' if no one got it!"
              : "Vote for the drawing closest to the word!"}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>
          {anonymous.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: myVote === null ? -4 : 0 }}
              onClick={() => myVote === null && onVote(item.id)}
              style={{
                border: myVote === item.id ? "3px solid #FF6B6B" : "2px solid #1a1a1a",
                borderRadius: "16px", overflow: "hidden",
                cursor: myVote !== null ? "default" : "pointer",
                boxShadow: myVote === item.id ? "4px 4px 0 #FF6B6B" : "3px 3px 0 #1a1a1a",
                background: "#fdf6ec"
              }}
            >
              <img src={item.image} alt={`Drawing ${item.id + 1}`}
                style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }} />
              <div style={{ padding: "10px", textAlign: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 700 }}>Drawing #{item.id + 1}</span>
                {myVote === item.id && <span style={{ fontSize: "11px", color: "#FF6B6B", marginLeft: "6px" }}>✓ Your vote</span>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* None Correct option */}
        {myVote === null && (
          <motion.button
            whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => onVote(-1)}
            style={{
              width: "100%", padding: "12px", borderRadius: "12px",
              border: "2px dashed #d1d5db", background: "#f9fafb",
              color: "#888", fontWeight: 700, fontSize: "13px",
              cursor: "pointer"
            }}
          >
            None of these are correct
          </motion.button>
        )}

        {myVote === -1 && (
          <div style={{ textAlign: "center", padding: "12px", color: "#888", fontSize: "13px" }}>
            Voted: None correct. Waiting for others...
          </div>
        )}
      </motion.div>
    </div>
  );
}