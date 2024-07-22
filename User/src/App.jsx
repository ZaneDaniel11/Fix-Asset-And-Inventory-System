import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Request from "./Request";
import RBondRequest from "./RequestBon";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/request" element={<Request />} />
        <Route path="/bondpaper" element={<RBondRequest />} />
      </Routes>
    </div>
  );
}

export default App;
