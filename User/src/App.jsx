import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import RequestHistory from "./RequestHistory";
import ProtectedRoute from "./ProtectedRoute";
import Request from "./Request/Request";
import BorrowStatus from "./Borrow/BorrowStatus/Borrows";

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
        <Route
          path="/BorrowStatus"
          element={<ProtectedRoute element={BorrowStatus} />}
        />
      </Routes>
    </div>
  );
}

export default App;
