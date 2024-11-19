import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./User/Borrow/Borrow";
import RequestHistory from "./User/History/RequestHistory";
import ProtectedRoute from "./ProtectedRoute";
import Request from "./User/Request/Request";
import BorrowStatus from "./User/BorrowStatus/Borrows";
import Maintenance from "./User/Maintenance/Maintenance";

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
        <Route
          path="/Maintenance"
          element={<ProtectedRoute element={Maintenance} />}
        />
      </Routes>
    </div>
  );
}

export default App;
