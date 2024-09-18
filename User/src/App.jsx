import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import RequestHistory from "./RequestHistory";
import ProtectedRoute from "./ProtectedRoute";
import Request from "./Request";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute element={Home} />} />
        <Route
          path="/requestHistory"
          element={<ProtectedRoute element={RequestHistory} />}
        />
        <Route
          path="/requestList"
          element={<ProtectedRoute element={Request} />}
        />
      </Routes>
    </div>
  );
}

export default App;
