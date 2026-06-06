import { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import JoinScreen from "./JoinScreen";

const socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:4000");

function Whiteboard() {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const chatEndRef = useRef(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState("pen");
  const [userName, setUserName] = useState(null);
  const [cursors, setCursors] = useState({});
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const { roomId } = useParams();

  useEffect(() => {
    if (!userName) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 60;
    socket.emit("join-room", { roomId, userName });
    socket.on("load-strokes", (strokes) => { strokes.forEach((s) => drawLine(s)); });
    socket.on("draw", (data) => drawLine(data));
    socket.on("clear", () => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    socket.on("cursor-move", ({ id, x, y, name }) => {
      setCursors((prev) => ({ ...prev, [id]: { x, y, name } }));
    });
    socket.on("user-left", (id) => {
      setCursors((prev) => { const u = { ...prev }; delete u[id]; return u; });
    });
    socket.on("chat-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    const preventScroll = (e) => e.preventDefault();
    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      socket.off("draw"); socket.off("clear"); socket.off("load-strokes");
      socket.off("cursor-move"); socket.off("user-left"); socket.off("chat-message");
      canvas.removeEventListener("touchstart", preventScroll);
      canvas.removeEventListener("touchmove", preventScroll);
    };
  }, [roomId, userName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!userName) return <JoinScreen onJoin={(name) => setUserName(name)} />;

  const drawLine = ({ x0, y0, x1, y1, color, brushSize, tool }) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
    ctx.lineWidth = tool === "eraser" ? 20 : brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.stroke();
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e) => { isDrawing.current = true; lastPos.current = getPos(e); };

  const draw = (e) => {
    const currentPos = getPos(e);
    socket.emit("cursor-move", { roomId, x: currentPos.x, y: currentPos.y, name: userName });
    if (!isDrawing.current) return;
    const data = { x0: lastPos.current.x, y0: lastPos.current.y, x1: currentPos.x, y1: currentPos.y, color, brushSize, tool, roomId, userName };
    drawLine(data);
    socket.emit("draw", data);
    lastPos.current = currentPos;
  };

  const stopDrawing = () => { isDrawing.current = false; lastPos.current = null; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear", roomId);
  };

  const sendMessage = () => {
    if (chatInput.trim() === "") return;
    socket.emit("chat-message", { roomId, name: userName, message: chatInput.trim() });
    setChatInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "white" }}>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "#f3f4f6", borderBottom: "1px solid #d1d5db", height: "56px", overflowX: "auto", flexShrink: 0 }}>
        <span style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "monospace", whiteSpace: "nowrap" }}>Room: {roomId}</span>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#3b82f6", whiteSpace: "nowrap" }}>{userName}</span>
        <label style={{ fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>Color:</label>
        <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setTool("pen"); }} style={{ width: "32px", height: "32px", cursor: "pointer", border: "none", borderRadius: "4px", flexShrink: 0 }} />
        <label style={{ fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>Size:</label>
        <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} style={{ width: "80px", flexShrink: 0 }} />
        <button onClick={() => setTool("pen")} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: tool === "pen" ? "none" : "1px solid #d1d5db", background: tool === "pen" ? "#3b82f6" : "white", color: tool === "pen" ? "white" : "#374151" }}>Pen</button>
        <button onClick={() => setTool("eraser")} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: tool === "eraser" ? "none" : "1px solid #d1d5db", background: tool === "eraser" ? "#3b82f6" : "white", color: tool === "eraser" ? "white" : "#374151" }}>Eraser</button>
        <button onClick={clearCanvas} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: "none", background: "#ef4444", color: "white" }}>Clear</button>
        <button onClick={() => setChatOpen(prev => !prev)} style={{ marginLeft: "auto", padding: "4px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none", background: chatOpen ? "#7c3aed" : "#8b5cf6", color: "white" }}>
          {chatOpen ? "Close Chat" : "Chat"}
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        <div style={{ flex: 1, position: "relative" }}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ cursor: "crosshair", touchAction: "none", display: "block" }}
          />
          {Object.entries(cursors).map(([id, { x, y, name }]) => (
            <div key={id} style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
              <div style={{ width: "12px", height: "12px", background: "#ef4444", borderRadius: "50%" }} />
              <span style={{ fontSize: "11px", background: "#ef4444", color: "white", padding: "1px 4px", borderRadius: "4px", marginLeft: "4px", whiteSpace: "nowrap" }}>{name}</span>
            </div>
          ))}
        </div>

        {chatOpen === true && (
          <div style={{ width: "280px", minWidth: "280px", maxWidth: "280px", height: "100%", display: "flex", flexDirection: "column", borderLeft: "2px solid #8b5cf6", background: "#fafafa" }}>
            <div style={{ padding: "12px 16px", background: "#8b5cf6", color: "white", fontWeight: 700, fontSize: "14px" }}>
              Room Chat
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {messages.length === 0 && (
                <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", marginTop: "20px" }}>No messages yet. Say hi!</p>
              )}
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.name === userName ? "flex-end" : "flex-start" }}>
                  <span style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "2px" }}>{msg.name} · {msg.time}</span>
                  <span style={{
                    fontSize: "13px", padding: "8px 12px", borderRadius: "16px",
                    maxWidth: "90%", wordBreak: "break-word",
                    background: msg.name === userName ? "#8b5cf6" : "#e5e7eb",
                    color: msg.name === userName ? "white" : "#1f2937"
                  }}>
                    {msg.message}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: "8px", padding: "10px", borderTop: "1px solid #e5e7eb" }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                style={{ flex: 1, fontSize: "13px", border: "1px solid #d1d5db", borderRadius: "20px", padding: "8px 14px", outline: "none" }}
              />
              <button onClick={sendMessage} style={{ background: "#8b5cf6", color: "white", border: "none", borderRadius: "20px", padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                Send
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Whiteboard;
