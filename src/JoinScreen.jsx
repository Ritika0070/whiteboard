import { useState } from "react";

function JoinScreen({ onJoin }) {
  const [name, setName] = useState("");

  const handleJoin = () => {
    if (name.trim() === "") return;
    onJoin(name.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleJoin();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Whiteboard</h1>
      <p className="text-gray-500 mb-8">Enter your name to start drawing</p>

      <div className="bg-white rounded-2xl shadow-md p-8 w-80 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="border border-gray-300 rounded-xl px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleJoin}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}

export default JoinScreen;