import { useState, useEffect, useRef } from "react";

export default function useGame(socket, roomId, userName, onlineUsers) {
  const [gamePhase, setGamePhase] = useState("idle");
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(3);
  const [hostIndex, setHostIndex] = useState(0);
  const [word, setWord] = useState("");
  const [revealData, setRevealData] = useState(null);
  const [roundWinner, setRoundWinner] = useState(null);
  const [gameWinner, setGameWinner] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [timer, setTimer] = useState(0);
  const [drawTime, setDrawTime] = useState(90);
  const timerRef = useRef(null);

  const isHost = players.length > 0 && players[hostIndex % players.length] === userName;

  const resetGame = () => {
    setGamePhase("idle");
    setPlayers([]);
    setScores({});
    setCurrentRound(0);
    setHostIndex(0);
    setWord("");
    setRevealData(null);
    setRoundWinner(null);
    setGameWinner(null);
    setMyVote(null);
    clearInterval(timerRef.current);
    setTimer(0);
  };

  useEffect(() => {
    socket.on("game-state", (state) => {
      setGamePhase(state.phase);
      setPlayers(state.players || []);
      setScores(state.scores || {});
      setCurrentRound(state.currentRound || 1);
      setTotalRounds(state.totalRounds || 3);
      setHostIndex(state.hostIndex || 0);
      setDrawTime(state.drawTime || 90);
    });
    socket.on("game-phase", ({ phase }) => setGamePhase(phase));
    socket.on("game-word-confirmed", ({ word }) => setWord(word));
    socket.on("game-reveal", (data) => {
      setRevealData(data);
      setGamePhase("reveal");
      setMyVote(null);
      clearInterval(timerRef.current);
      setTimer(0);
    });
    socket.on("game-round-end", ({ scores, roundWinner, round, totalRounds }) => {
      setScores(scores);
      setRoundWinner(roundWinner);
      setGamePhase("scoring");
      setCurrentRound(round);
      setTotalRounds(totalRounds);
    });
    socket.on("game-next-round", ({ round, hostIndex, players, drawTime }) => {
      setCurrentRound(round);
      setHostIndex(hostIndex);
      setPlayers(players);
      setGamePhase("host-turn");
      setRoundWinner(null);
      setRevealData(null);
      setWord("");
      setDrawTime(drawTime || 90);
    });
    socket.on("game-over", ({ scores, winner }) => {
      setScores(scores);
      setGameWinner(winner);
      setGamePhase("game-over");
    });
    socket.on("game-ended", () => resetGame());

    return () => {
      socket.off("game-state");
      socket.off("game-phase");
      socket.off("game-word-confirmed");
      socket.off("game-reveal");
      socket.off("game-round-end");
      socket.off("game-next-round");
      socket.off("game-over");
      socket.off("game-ended");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const startTimer = (seconds, onDone) => {
    setTimer(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onDone && onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startGame = (rounds, drawTime) => {
    socket.emit("game-setup", { roomId, totalRounds: rounds, drawTime });
  };

  const submitWord = (w) => {
    setWord(w);
    socket.emit("game-set-word", { roomId, word: w });
  };

  const submitCanvas = (imageData) => {
    socket.emit("game-submit-canvas", { roomId, userName, imageData });
  };

  const castVote = (id) => {
    if (myVote !== null) return;
    setMyVote(id);
    socket.emit("game-vote", { roomId, voterName: userName, winnerIndex: id });
  };

  const endGame = () => {
    socket.emit("game-end", { roomId });
  };

  return {
    gamePhase, players, scores, currentRound, totalRounds,
    hostIndex, word, revealData, roundWinner, gameWinner,
    isHost, myVote, timer, drawTime,
    startGame, submitWord, submitCanvas, castVote, endGame,
    startTimer,
  };
}