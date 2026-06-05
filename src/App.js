import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Whiteboard from "./Whiteboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Whiteboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;