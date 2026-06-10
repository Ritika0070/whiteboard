import { useState, useEffect, useRef } from "react";

export default function useGame(socket, roomId, userName, onlineUsers) {
  const [gamePhase, setGamePhase] = useState("idle"); // idle | setup | host-turn | drawing | reveal | scoring | game-over
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(3);
  const [hostIndex, setHostIndex] = useState(0);
  const [word, setWord] = useState("");
  const [revealData, setRevealData] = useState(null); // { anonymous, word }
  const [roundWinner, setRoundWinner] = useState(null);
  const [gameWinner, setGameWinner] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  const isHost = players.length > 0 && players[hostIndex % players.length] === userName;

  useEffect(() => {
    socket.on("game-state", (state) => {
      setGamePhase(state.phase);
      setPlayers(state.players || []);
      setScores(state.scores || {});
      setCurrentRound(state.currentRound || 1);
      setTotalRounds(state.totalRounds || 3);
      setHostIndex(state.hostIndex || 0);
    });

    socket.on("game-phase", ({ phase }) => setGamePhase(phase));

    socket.on("game-word-confirmed", ({ word }) => setWord(word));

    socket.on("game-reveal", (data) => {
      setRevealData(data);
      setGamePhase("reveal");
      setMyVote(null);
      stopTimer();
    });

    socket.on("game-round-end", ({ scores, roundWinner, round, totalRounds }) => {
      setScores(scores);
      setRoundWinner(roundWinner);
      setGamePhase("scoring");
      setCurrentRound(round);
      setTotalRounds(totalRounds);
    });

    socket.on("game-next-round", ({ round, hostIndex, players }) => {
      setCurrentRound(round);
      setHostIndex(hostIndex);
      setPlayers(players);
      setGamePhase("host-turn");
      setRoundWinner(null);
      setRevealData(null);
      setWord("");
    });

    socket.on("game-over", ({ scores, winner }) => {
      setScores(scores);
      setGameWinner(winner);
      setGamePhase("game-over");
    });

    socket.on("game-ended", () => {
      resetGame();
    });

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
  }, [socket]); // eslint-disable-line // eslint-disable-line

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

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setTimer(0);
  };

  const startGame = (rounds) => {
    setTotalRounds(rounds);
    socket.emit("game-setup", { roomId, totalRounds: rounds });
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
    stopTimer();
  };

  return {
    gamePhase, players, scores, currentRound, totalRounds,
    hostIndex, word, revealData, roundWinner, gameWinner,
    isHost, myVote, timer,
    startGame, submitWord, submitCanvas, castVote, endGame,
    startTimer, stopTimer,
  };
}