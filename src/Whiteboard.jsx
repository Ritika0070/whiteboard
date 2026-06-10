import { useState } from "react";
import { useParams } from "react-router-dom";
import Toolbar from "./Toolbar";
import ChatSidebar from "./ChatSidebar";
import useWhiteboard from "./useWhiteboard";

function Whiteboard() {
  const { roomId } = useParams();
  const [userName, setUserName] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const {
    canvasRef, containerRef, color, setColor, brushSize, setBrushSize,
    tool, setTool, cursors, onlineUsers,
    startDrawing, draw, stopDrawing, clearCanvas, downloadCanvas, undo, redo,
    socket,
  } = useWhiteboard(roomId, userName);

  if (!userName) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "white" }}>

      <Toolbar
        roomId={roomId} userName={userName}
        color={color} setColor={setColor}
        brushSize={brushSize} setBrushSize={setBrushSize}
        tool={tool} setTool={setTool}
        clearCanvas={clearCanvas} downloadCanvas={downloadCanvas}
        undo={undo} redo={redo}
        chatOpen={chatOpen} setChatOpen={setChatOpen}
        onlineUsers={onlineUsers}
      />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
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

        {chatOpen && (
          <ChatSidebar
            socket={socket}
            roomId={roomId}
            userName={userName}
            onClose={() => setChatOpen(false)}
          />
        )}

      </div>
    </div>
  );
}

export default Whiteboard;