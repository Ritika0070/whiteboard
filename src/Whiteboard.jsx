import { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import JoinScreen from "./JoinScreen";

const socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:4000");

function Whiteboard() {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState("pen");
  const [userName, setUserName] = useState(null);
  const [cursors, setCursors] = useState({});
  const { roomId } = useParams();

  useEffect(() => {
    if (!userName) return; // userName nahi hai toh kuch mat karo

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 60;

    socket.emit("join-room", { roomId, userName });

    socket.on("load-strokes", (strokes) => {
      strokes.forEach((stroke) => drawLine(stroke));
    });

    socket.on("draw", (data) => {
      drawLine(data);
    });

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

    const preventScroll = (e) => e.preventDefault();
    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      socket.off("draw");
      socket.off("clear");
      socket.off("load-strokes");
      socket.off("cursor-move");
      socket.off("user-left");
      canvas.removeEventListener("touchstart", preventScroll);
      canvas.removeEventListener("touchmove", preventScroll);
    };
  }, [roomId, userName]);

  // JoinScreen — useEffect ke baad
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
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    const currentPos = getPos(e);

    socket.emit("cursor-move", {
      roomId,
      x: currentPos.x,
      y: currentPos.y,
      name: userName,
    });

    if (!isDrawing.current) return;

    const data = {
      x0: lastPos.current.x,
      y0: lastPos.current.y,
      x1: currentPos.x,
      y1: currentPos.y,
      color,
      brushSize,
      tool,
      roomId,
      userName,
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

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-b border-gray-300 h-14 overflow-x-auto">
        <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
          Room: {roomId}
        </span>

        <span className="text-xs font-medium text-blue-500 whitespace-nowrap">
          👤 {userName}
        </span>

        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Color:</label>
        <input
          type="color"
          value={color}
          onChange={(e) => { setColor(e.target.value); setTool("pen"); }}
          className="w-8 h-8 cursor-pointer rounded flex-shrink-0"
        />

        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Size:</label>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-20 flex-shrink-0"
        />

        <button
          onClick={() => setTool("pen")}
          className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap flex-shrink-0 ${
            tool === "pen"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Pen
        </button>

        <button
          onClick={() => setTool("eraser")}
          className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap flex-shrink-0 ${
            tool === "eraser"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Eraser
        </button>

        <button
          onClick={clearCanvas}
          className="px-3 py-1 rounded text-sm font-medium bg-red-500 text-white whitespace-nowrap flex-shrink-0"
        >
          Clear
        </button>
      </div>

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
          <div
            key={id}
            className="absolute pointer-events-none"
            style={{ left: x, top: y }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-xs bg-red-500 text-white px-1 rounded ml-1 whitespace-nowrap">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Whiteboard;