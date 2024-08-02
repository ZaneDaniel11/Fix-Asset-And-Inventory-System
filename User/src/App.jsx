import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Request from "./Request";
import Historys from "./History";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute element={Home} />} />
        <Route path="/request" element={<ProtectedRoute element={Request} />} />
        <Route
          path="/History"
          element={<ProtectedRoute element={Historys} />}
        />
      </Routes>
    </div>
  );
}

export default App;
