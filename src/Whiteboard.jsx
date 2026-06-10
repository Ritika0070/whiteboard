import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import Toolbar from "./Toolbar";
import ChatSidebar from "./ChatSidebar";
import useWhiteboard from "./useWhiteboard";
import useGame from "./game/useGame";
import GameSetup from "./game/GameSetup";
import HostScreen from "./game/HostScreen";
import DrawingPhase from "./game/DrawingPhase";
import RevealPhase from "./game/RevealPhase";
import Scoreboard from "./game/Scoreboard";

function Whiteboard() {
  const { roomId } = useParams();
  const location = useLocation();
  const [userName] = useState(location.state?.userName || null);
  const [chatOpen, setChatOpen] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [currentHints, setCurrentHints] = useState([]);
  const [submittedCount, setSubmittedCount] = useState(0);
  const canvasSubmittedRef = useRef(false);

  const {
    canvasRef, containerRef, color, setColor, brushSize, setBrushSize,
    tool, setTool, cursors, onlineUsers,
    startDrawing, draw, stopDrawing, clearCanvas, downloadCanvas, undo, redo,
    socket,
  } = useWhiteboard(roomId, userName);

  const game = useGame(socket, roomId, userName, onlineUsers);

  const isDrawingPhase = game.gamePhase === "drawing";
  const isLocked = game.isHost && isDrawingPhase;

  // When drawing phase starts, begin the 90s timer
  useEffect(() => {
    if (isDrawingPhase && !game.isHost) {
      canvasSubmittedRef.current = false;
      game.startTimer(90, handleTimeUp);
    }
    if (isDrawingPhase && game.isHost) {
      setSubmittedCount(0);
    }
  }, [isDrawingPhase]); // eslint-disable-line

  // Track submitted count
  useEffect(() => {
    socket.on("game-canvas-submitted", () => {
      setSubmittedCount(prev => prev + 1);
    });
    return () => socket.off("game-canvas-submitted");
  }, [socket]);

  const handleTimeUp = () => {
    if (canvasSubmittedRef.current) return;
    canvasSubmittedRef.current = true;
    const canvas = canvasRef.current;
    if (canvas) game.submitCanvas(canvas.toDataURL());
  };

  const handleHostSubmitWord = (word, hints) => {
    setCurrentHints(hints);
    game.submitWord(word);
    // Broadcast hints to all players
    socket.emit("game-hints", { roomId, hints });
  };

  // Listen for hints
  useEffect(() => {
    socket.on("game-hints", ({ hints }) => setCurrentHints(hints));
    return () => socket.off("game-hints");
  }, [socket]);

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
        gameActive={game.gamePhase !== "idle"}
        onStartGame={() => setShowSetup(true)}
        onEndGame={game.endGame}
        currentRound={game.currentRound}
        totalRounds={game.totalRounds}
      />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div
          ref={containerRef}
          style={{ flex: 1, position: "relative", overflow: "hidden", filter: isLocked ? "brightness(0.92)" : "none" }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={isLocked ? undefined : startDrawing}
            onMouseMove={isLocked ? undefined : draw}
            onMouseUp={isLocked ? undefined : stopDrawing}
            onMouseLeave={isLocked ? undefined : stopDrawing}
            onTouchStart={isLocked ? undefined : startDrawing}
            onTouchMove={isLocked ? undefined : draw}
            onTouchEnd={isLocked ? undefined : stopDrawing}
            style={{ cursor: isLocked ? "not-allowed" : "crosshair", touchAction: "none", display: "block" }}
          />
          {isLocked && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ background: "rgba(255,255,255,0.85)", border: "2px dashed #d1d5db", borderRadius: "12px", padding: "12px 24px", fontSize: "14px", color: "#888" }}>
                Waiting for players to draw...
              </div>
            </div>
          )}
          {!isDrawingPhase && Object.entries(cursors).map(([id, { x, y, name }]) => (
            <div key={id} style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
              <div style={{ width: "12px", height: "12px", background: "#ef4444", borderRadius: "50%" }} />
              <span style={{ fontSize: "11px", background: "#ef4444", color: "white", padding: "1px 4px", borderRadius: "4px", marginLeft: "4px", whiteSpace: "nowrap" }}>{name}</span>
            </div>
          ))}
        </div>

        {chatOpen && (
          <ChatSidebar socket={socket} roomId={roomId} userName={userName} onClose={() => setChatOpen(false)} />
        )}
      </div>

      {/* Game overlays */}
      {showSetup && (
        <GameSetup
          playerCount={onlineUsers.length}
          onStart={(rounds) => { game.startGame(rounds); setShowSetup(false); }}
          onCancel={() => setShowSetup(false)}
        />
      )}

      {game.gamePhase === "host-turn" && game.isHost && (
        <HostScreen
          onSubmit={handleHostSubmitWord}
          round={game.currentRound}
          totalRounds={game.totalRounds}
        />
      )}

      {game.gamePhase === "host-turn" && !game.isHost && (
        <div style={{ position: "fixed", top: "70px", left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
          <div style={{ background: "white", border: "2px solid #1a1a1a", borderRadius: "12px", boxShadow: "3px 3px 0 #1a1a1a", padding: "12px 24px", fontSize: "13px", color: "#888" }}>
            Round {game.currentRound}/{game.totalRounds} — Waiting for {game.players[game.hostIndex % game.players.length]} to pick a word...
          </div>
        </div>
      )}

      {isDrawingPhase && (
        <DrawingPhase
          hints={currentHints}
          timer={game.timer}
          isHost={game.isHost}
          word={game.word}
          totalPlayers={onlineUsers.length}
          submittedCount={submittedCount}
          onTimeUp={handleTimeUp}
        />
      )}

      {game.gamePhase === "reveal" && (
        <RevealPhase
          data={game.revealData}
          myVote={game.myVote}
          onVote={game.castVote}
          isHost={game.isHost}
          userName={userName}
        />
      )}

      {(game.gamePhase === "scoring" || game.gamePhase === "game-over") && (
        <Scoreboard
          scores={game.scores}
          roundWinner={game.roundWinner}
          gameWinner={game.gameWinner}
          round={game.currentRound}
          totalRounds={game.totalRounds}
          isHost={game.isHost}
          onNext={game.endGame}
        />
      )}
    </div>
  );
}

export default Whiteboard;