import { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { MessageSquare, Send, Pen, Eraser, Trash2, X } from "lucide-react";
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

    socket.on("load-strokes", (strokes) => {
      strokes.forEach((stroke) => drawLine(stroke));
    });

    socket.on("draw", (data) => drawLine(data));

    socket.on("clear", () => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    socket.on("cursor-move", ({ id, x, y, name }) => {
      setCursors((prev) => ({ ...prev, [id]: { x, y, name } }));
    });

    socket.on("user-left", (id) => {
      setCursors((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    });

    socket.on("chat-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    const preventScroll = (e) => e.preventDefault();
    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      socket.off("draw");
      socket.off("clear");
      socket.off("load-strokes");
      socket.off("cursor-move");
      socket.off("user-left");
      socket.off("chat-message");
      canvas.removeEventListener("touchstart", preventScroll);
      canvas.removeEventListener("touchmove", preventScroll);
    };
  }, [roomId, userName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!userName) {
    return <JoinScreen onJoin={(name) => setUserName(name)} />;
  }

  const drawLine = ({ x0, y0, x1, y1, color, brushSize, tool }) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineWidth = tool === "eraser" ? 20 : brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.stroke();
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    const currentPos = getPos(e);
    socket.emit("cursor-move", { roomId, x: currentPos.x, y: currentPos.y, name: userName });
    if (!isDrawing.current) return;
    const data = {
      x0: lastPos.current.x,
      y0: lastPos.current.y,
      x1: currentPos.x,
      y1: currentPos.y,
      color, brushSize, tool, roomId, userName,
    };
    drawLine(data);
    socket.emit("draw", data);
    lastPos.current = currentPos;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

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

  const handleChatKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-b border-gray-300 h-14 overflow-x-auto">
        <span className="text-xs text-gray-400 font-mono whitespace-nowrap">Room: {roomId}</span>
        <span className="text-xs font-medium text-blue-500 whitespace-nowrap">{userName}</span>

        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Color:</label>
        <input
          type="color"
          value={color}
          onChange={(e) => { setColor(e.target.value); setTool("pen"); }}
          className="w-8 h-8 cursor-pointer rounded flex-shrink-0"
        />

        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Size:</label>
        <input
          type="range" min="1" max="20" value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-20 flex-shrink-0"
        />

        <button
          onClick={() => setTool("pen")}
          className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium whitespace-nowrap flex-shrink-0 ${tool === "pen" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-300"}`}
        >
          <Pen size={14} /> Pen
        </button>

        <button
          onClick={() => setTool("eraser")}
          className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium whitespace-nowrap flex-shrink-0 ${tool === "eraser" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-300"}`}
        >
          <Eraser size={14} /> Eraser
        </button>

        <button
          onClick={clearCanvas}
          className="flex items-center gap-1 px-3 py-1 rounded text-sm font-medium bg-red-500 text-white whitespace-nowrap flex-shrink-0"
        >
          <Trash2 size={14} /> Clear
        </button>

        <button
          onClick={() => setChatOpen((prev) => !prev)}
          className={`flex items-center gap-1 ml-auto px-3 py-1 rounded text-sm font-medium whitespace-nowrap flex-shrink-0 ${chatOpen ? "bg-purple-600 text-white" : "bg-purple-500 text-white"}`}
        >
          <MessageSquare size={14} /> Chat
        </button>
      </div>

      {/* Main area */}
      <div className="relative flex-1 flex overflow-hidden">

        {/* Canvas */}
        <div className="relative flex-1">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="cursor-crosshair touch-none"
            style={{ touchAction: "none" }}
          />
          {Object.entries(cursors).map(([id, { x, y, name }]) => (
            <div key={id} className="absolute pointer-events-none" style={{ left: x, top: y }}>
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-xs bg-red-500 text-white px-1 rounded ml-1 whitespace-nowrap">{name}</span>
            </div>
          ))}
        </div>

        {/* Chat Sidebar */}
        {chatOpen && (
          <div className="w-64 flex flex-col border-l border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b border-gray-200">
              <span className="font-semibold text-sm text-gray-700 flex items-center gap-1">
                <MessageSquare size={14} /> Chat
              </span>
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
              {messages.length === 0 && (
                <p className="text-xs text-gray-400 text-center mt-4">No messages yet...</p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.name === userName ? "items-end" : "items-start"}`}>
                  <span className="text-xs text-gray-400">{msg.name} · {msg.time}</span>
                  <span className={`text-sm px-3 py-1 rounded-2xl max-w-full break-words ${msg.name === userName ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-800"}`}>
                    {msg.message}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="flex items-center gap-1 px-2 py-2 border-t border-gray-200">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKey}
                placeholder="Type a message..."
                className="flex-1 text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={sendMessage}
                className="bg-purple-500 text-white p-2 rounded-xl hover:bg-purple-600"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Whiteboard;