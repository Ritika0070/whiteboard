import { motion } from "framer-motion";

const PRESET_COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C77DFF", "#FF9A3C", "#000000", "#ffffff"];

export default function Toolbar({
  roomId, userName, color, setColor, brushSize, setBrushSize,
  tool, setTool, clearCanvas, downloadCanvas, undo, redo,
  chatOpen, setChatOpen, onlineUsers,
  gameActive, onStartGame, onEndGame, currentRound, totalRounds
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "#1a1a1a", borderBottom: "1px solid rgba(255,255,255,0.08)", height: "56px", overflowX: "auto", flexShrink: 0 }}>

      <span style={{ fontSize: "13px", fontWeight: 900, color: "white", whiteSpace: "nowrap" }}>Scribble!</span>

      <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />

      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", whiteSpace: "nowrap" }}>{roomId}</span>
      <span style={{ fontSize: "12px", fontWeight: 600, color: "#4D96FF", whiteSpace: "nowrap" }}>{userName}</span>

      {gameActive && (
        <div style={{ padding: "3px 10px", borderRadius: "8px", background: "rgba(255,107,107,0.2)", border: "1px solid #FF6B6B", fontSize: "11px", fontWeight: 700, color: "#FF6B6B", whiteSpace: "nowrap" }}>
          Round {currentRound}/{totalRounds}
        </div>
      )}

      <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />

      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
        {PRESET_COLORS.map((c) => (
          <motion.div key={c} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
            onClick={() => { setColor(c); setTool("pen"); }}
            style={{ width: "20px", height: "20px", borderRadius: "50%", background: c, cursor: "pointer", border: color === c ? "2px solid white" : "2px solid transparent", boxSizing: "border-box", flexShrink: 0 }}
          />
        ))}
        <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setTool("pen"); }}
          style={{ width: "20px", height: "20px", cursor: "pointer", border: "none", borderRadius: "50%", flexShrink: 0, padding: 0, background: "none" }} title="Custom color" />
      </div>

      <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />

      <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))}
        style={{ width: "70px", flexShrink: 0, accentColor: "#C77DFF" }} />

      <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />

      {[{ label: "Pen", value: "pen" }, { label: "Eraser", value: "eraser" }].map(({ label, value }) => (
        <motion.button key={value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setTool(value)}
          style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none", background: tool === value ? "linear-gradient(135deg, #FF6B6B, #C77DFF)" : "rgba(255,255,255,0.08)", color: "white", whiteSpace: "nowrap", flexShrink: 0 }}>
          {label}
        </motion.button>
      ))}

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={undo}
        style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none", background: "rgba(255,255,255,0.08)", color: "white", whiteSpace: "nowrap", flexShrink: 0 }}>
        Undo
      </motion.button>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={redo}
        style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none", background: "rgba(255,255,255,0.08)", color: "white", whiteSpace: "nowrap", flexShrink: 0 }}>
        Redo
      </motion.button>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={clearCanvas}
        style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none", background: "rgba(239,68,68,0.3)", color: "#ff6b6b", whiteSpace: "nowrap", flexShrink: 0 }}>
        Clear
      </motion.button>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={downloadCanvas}
        style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none", background: "rgba(16,185,129,0.3)", color: "#6bcb77", whiteSpace: "nowrap", flexShrink: 0 }}>
        Download
      </motion.button>

      <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "8px", background: "rgba(34,197,94,0.15)", whiteSpace: "nowrap", flexShrink: 0 }}>
        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
        <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 500 }}>{onlineUsers.length} online</span>
      </div>

      {!gameActive ? (
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onStartGame}
          style={{ padding: "4px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", border: "none", background: "linear-gradient(135deg, #FFD93D, #FF9A3C)", color: "#1a1a1a", whiteSpace: "nowrap", flexShrink: 0 }}>
          Doodle Wars!
        </motion.button>
      ) : (
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onEndGame}
          style={{ padding: "4px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", border: "none", background: "rgba(239,68,68,0.3)", color: "#ff6b6b", whiteSpace: "nowrap", flexShrink: 0 }}>
          End Game
        </motion.button>
      )}

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setChatOpen(prev => !prev)}
        style={{ marginLeft: "auto", padding: "4px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", border: "none", background: chatOpen ? "rgba(139,92,246,0.5)" : "linear-gradient(135deg, #8b5cf6, #C77DFF)", color: "white", whiteSpace: "nowrap", flexShrink: 0 }}>
        {chatOpen ? "Close Chat" : "Chat"}
      </motion.button>
    </div>
  );
}