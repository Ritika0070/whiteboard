import { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:4000");

export default function useWhiteboard(roomId, userName) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawing = useRef(false);
  const clickLock = useRef(false);
  const lastPos = useRef(null);
  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const privateMode = useRef(false);

  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState("pen");
  const [cursors, setCursors] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!userName) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    socket.emit("join-room", { roomId, userName });

    socket.on("online-users", (users) => setOnlineUsers(users));

    socket.on("load-strokes", (strokes) => {
      strokes.forEach((s) => drawLine(s));
    });

    socket.on("draw", (data) => {
      if (privateMode.current) return;
      drawLine(data);
    });

    socket.on("clear", () => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      historyRef.current = [];
      redoRef.current = [];
    });

    socket.on("cursor-move", ({ id, x, y, name }) => {
      setCursors((prev) => ({ ...prev, [id]: { x, y, name } }));
    });

    socket.on("user-left", (id) => {
      setCursors((prev) => { const u = { ...prev }; delete u[id]; return u; });
    });

    socket.on("game-phase", ({ phase }) => {
      if (phase === "drawing") {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        historyRef.current = [];
        redoRef.current = [];
        privateMode.current = true;
        // Reset click lock
        clickLock.current = false;
        isDrawing.current = false;
        lastPos.current = null;
      } else {
        privateMode.current = false;
        clickLock.current = false;
        isDrawing.current = false;
        lastPos.current = null;
      }
    });

    socket.on("game-ended", () => {
      privateMode.current = false;
      clickLock.current = false;
      isDrawing.current = false;
      lastPos.current = null;
    });

    const preventScroll = (e) => e.preventDefault();
    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      socket.off("draw"); socket.off("clear"); socket.off("load-strokes");
      socket.off("cursor-move"); socket.off("user-left");
      socket.off("online-users"); socket.off("game-phase"); socket.off("game-ended");
      canvas.removeEventListener("touchstart", preventScroll);
      canvas.removeEventListener("touchmove", preventScroll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userName]);

  const drawLine = ({ x0, y0, x1, y1, color, brushSize, tool }) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
    ctx.lineWidth = tool === "eraser" ? 20 : brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.stroke();
  };

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    historyRef.current.push(canvas.toDataURL());
    redoRef.current = [];
  };

  const undo = () => {
    if (historyRef.current.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    redoRef.current.push(canvas.toDataURL());
    const prev = historyRef.current.pop();
    const img = new Image();
    img.src = prev;
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
  };

  const redo = () => {
    if (redoRef.current.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    historyRef.current.push(canvas.toDataURL());
    const next = redoRef.current.pop();
    const img = new Image();
    img.src = next;
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e) => {
    if (clickLock.current) {
      // Dobara click — drawing band karo
      clickLock.current = false;
      isDrawing.current = false;
      lastPos.current = null;
    } else {
      // Pehla click — drawing shuru
      saveSnapshot();
      clickLock.current = true;
      isDrawing.current = true;
      lastPos.current = getPos(e);
    }
  };

  const draw = (e) => {
    const currentPos = getPos(e);
    socket.emit("cursor-move", { roomId, x: currentPos.x, y: currentPos.y, name: userName });
    if (!isDrawing.current) return;
    const data = {
      x0: lastPos.current.x, y0: lastPos.current.y,
      x1: currentPos.x, y1: currentPos.y,
      color, brushSize, tool, roomId, userName
    };
    drawLine(data);
    if (!privateMode.current) socket.emit("draw", data);
    lastPos.current = currentPos;
  };

  const stopDrawing = () => {
    // Click lock mode mein stopDrawing ignore hoga
    if (clickLock.current) return;
    isDrawing.current = false;
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    historyRef.current = [];
    redoRef.current = [];
    clickLock.current = false;
    isDrawing.current = false;
    if (!privateMode.current) socket.emit("clear", roomId);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `whiteboard-${roomId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return {
    canvasRef, containerRef, color, setColor, brushSize, setBrushSize,
    tool, setTool, cursors, onlineUsers,
    startDrawing, draw, stopDrawing, clearCanvas, downloadCanvas, undo, redo,
    socket,
  };
}