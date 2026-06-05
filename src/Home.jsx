import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    // Random 6 character room code banao
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${code}`);
  };

  const joinRoom = () => {
    if (roomCode.trim() === "") return;
    navigate(`/room/${roomCode.toUpperCase()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Whiteboard</h1>
      <p className="text-gray-500 mb-10">Real-time collaborative drawing</p>

      <div className="bg-white rounded-2xl shadow-md p-8 w-80 flex flex-col gap-4">
        <button
          onClick={createRoom}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition"
        >
          Create New Room
        </button>

        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 text-center tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={joinRoom}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;