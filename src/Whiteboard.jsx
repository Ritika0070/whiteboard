import { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

// const socket = io("http://localhost:4000");
// const socket = io("https://whiteboard-backend-t4ub.onrender.com");
const socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:4000");

function Whiteboard() {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState("pen");
  const { roomId } = useParams();

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 60;

    socket.emit("join-room", roomId);

    // Purani drawings load karo
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

    return () => {
      socket.off("draw");
      socket.off("clear");
      socket.off("load-strokes");
    };
  }, [roomId]);

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
    if (!isDrawing.current) return;
    const currentPos = getPos(e);

    const data = {
      x0: lastPos.current.x,
      y0: lastPos.current.y,
      x1: currentPos.x,
      y1: currentPos.y,
      color,
      brushSize,
      tool,
      roomId,
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
    <div className="flex flex-col h-screen bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-100 border-b border-gray-300 h-14">

        <span className="text-xs text-gray-400 font-mono">Room: {roomId}</span>

        <label className="text-sm font-medium text-gray-700">Color:</label>
        <input
          type="color"
          value={color}
          onChange={(e) => { setColor(e.target.value); setTool("pen"); }}
          className="w-8 h-8 cursor-pointer rounded"
        />

        <label className="text-sm font-medium text-gray-700">Size:</label>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-24"
        />

        <button
          onClick={() => setTool("pen")}
          className={`px-3 py-1 rounded text-sm font-medium ${
            tool === "pen"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Pen
        </button>

        <button
          onClick={() => setTool("eraser")}
          className={`px-3 py-1 rounded text-sm font-medium ${
            tool === "eraser"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Eraser
        </button>

        <button
          onClick={clearCanvas}
          className="px-3 py-1 rounded text-sm font-medium bg-red-500 text-white"
        >
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="cursor-crosshair"
      />
    </div>
  );
}

export default Whiteboard;