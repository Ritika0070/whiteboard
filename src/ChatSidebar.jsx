import { useRef, useEffect, useState } from "react";

export default function ChatSidebar({ socket, roomId, userName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on("chat-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => socket.off("chat-message");
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (chatInput.trim() === "") return;
    socket.emit("chat-message", { roomId, name: userName, message: chatInput.trim() });
    setChatInput("");
  };

  return (
    <div style={{ width: "280px", minWidth: "280px", display: "flex", flexDirection: "column", borderLeft: "2px solid #8b5cf6", background: "#fafafa", zIndex: 10 }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#8b5cf6", color: "white", flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: "14px" }}>Room Chat</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>x</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.length === 0 && (
          <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", marginTop: "20px" }}>No messages yet. Say hi!</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.name === userName ? "flex-end" : "flex-start" }}>
            <span style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "2px" }}>{msg.name} · {msg.time}</span>
            <span style={{ fontSize: "13px", padding: "8px 12px", borderRadius: "16px", maxWidth: "90%", wordBreak: "break-word", background: msg.name === userName ? "#8b5cf6" : "#e5e7eb", color: msg.name === userName ? "white" : "#1f2937" }}>
              {msg.message}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: "flex", gap: "8px", padding: "10px", borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
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
  );
}