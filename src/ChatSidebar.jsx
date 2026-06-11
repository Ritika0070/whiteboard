import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ChatSidebar({ socket, roomId, userName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };
    socket.on("chat-message", handleMessage);
    return () => socket.off("chat-message", handleMessage);
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
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ width: "280px", minWidth: "280px", display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.08)", background: "#141414", zIndex: 10 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#1a1a1a", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: "14px", color: "white" }}>Room Chat</span>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "14px", width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.length === 0 && (
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "20px" }}>No messages yet. Say hi!</p>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: msg.name === userName ? "flex-end" : "flex-start" }}
          >
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "3px" }}>{msg.name} · {msg.time}</span>
            <span style={{ fontSize: "13px", padding: "8px 12px", borderRadius: "16px", maxWidth: "90%", wordBreak: "break-word", background: msg.name === userName ? "linear-gradient(135deg, #8b5cf6, #C77DFF)" : "rgba(255,255,255,0.08)", color: "white" }}>
              {msg.message}
            </span>
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: "flex", gap: "8px", padding: "10px", borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: 1, fontSize: "13px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "8px 14px", outline: "none", background: "rgba(255,255,255,0.06)", color: "white" }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={sendMessage}
          style={{ background: "linear-gradient(135deg, #8b5cf6, #C77DFF)", color: "white", border: "none", borderRadius: "20px", padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
        >
          Send
        </motion.button>
      </div>
    </motion.div>
  );
}