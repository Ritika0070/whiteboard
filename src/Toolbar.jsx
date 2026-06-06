export default function Toolbar({ roomId, userName, color, setColor, brushSize, setBrushSize, tool, setTool, clearCanvas, downloadCanvas, undo, redo, chatOpen, setChatOpen, onlineUsers }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "#f3f4f6", borderBottom: "1px solid #d1d5db", height: "56px", overflowX: "auto", flexShrink: 0 }}>

      <span style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "monospace", whiteSpace: "nowrap" }}>Room: {roomId}</span>
      <span style={{ fontSize: "12px", fontWeight: 600, color: "#3b82f6", whiteSpace: "nowrap" }}>{userName}</span>

      <label style={{ fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>Color:</label>
      <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setTool("pen"); }} style={{ width: "32px", height: "32px", cursor: "pointer", border: "none", borderRadius: "4px", flexShrink: 0 }} />

      <label style={{ fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>Size:</label>
      <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} style={{ width: "80px", flexShrink: 0 }} />

      <button onClick={() => setTool("pen")} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: tool === "pen" ? "none" : "1px solid #d1d5db", background: tool === "pen" ? "#3b82f6" : "white", color: tool === "pen" ? "white" : "#374151" }}>Pen</button>

      <button onClick={() => setTool("eraser")} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: tool === "eraser" ? "none" : "1px solid #d1d5db", background: tool === "eraser" ? "#3b82f6" : "white", color: tool === "eraser" ? "white" : "#374151" }}>Eraser</button>

      <button onClick={undo} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: "1px solid #d1d5db", background: "white", color: "#374151" }}>Undo</button>

      <button onClick={redo} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: "1px solid #d1d5db", background: "white", color: "#374151" }}>Redo</button>

      <button onClick={clearCanvas} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: "none", background: "#ef4444", color: "white" }}>Clear</button>

      <button onClick={downloadCanvas} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: "none", background: "#10b981", color: "white" }}>Download</button>

      <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px", background: "#f0fdf4", border: "1px solid #bbf7d0", whiteSpace: "nowrap", flexShrink: 0 }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
        <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 500 }}>{onlineUsers.length} online</span>
      </div>

      <button onClick={() => setChatOpen(prev => !prev)} style={{ marginLeft: "auto", padding: "4px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none", background: "#8b5cf6", color: "white", flexShrink: 0 }}>
        {chatOpen ? "Close Chat" : "Chat"}
      </button>

    </div>
  );
}