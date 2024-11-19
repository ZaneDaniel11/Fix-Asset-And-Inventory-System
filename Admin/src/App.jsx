import React from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Login.jsx";
import Users from "./Inventory/User/User.jsx";
import Inventory from "./Inventory/Inventory/Inventory.jsx";
import Dashboard from "./Inventory/Dashboard/Dashboard.jsx";
import InventoryTable from "./Inventory/Inventory/Components/Table/Inventory_table.jsx";
import BorrowedRequest from "./Inventory/Request/BorrowRequest.jsx";
import RequestItems from "./Inventory/Request/RequestItems.jsx";
import Logs from "./Inventory/Logs/Log.jsx";
import Sidebar from "./Components/Sidebar.jsx";
import BorrowedItems from "./Inventory/Borrowed/BorrowedItems.jsx";

// Asset Admin
import AssetInventory from "./Asset/Inventory/AInventory.jsx";
import AssetInvenTable from "./Asset/Inventory/Components/CategoryItem/InventoryItemTable.jsx";
import Schedule from "./Asset/Schedule/Schedule.jsx";
import { ToastContainer } from "react-toastify";

// User Side
import UserBorrow from "./User/Borrow/Borrow.jsx";
import UserBorrowStatus from "./User/BorrowStatus/Borrows.jsx";
import UserRequestItem from "./User/Request/Request.jsx";
import UserRequestMaintenance from "./User/Maintenance/Maintenance.jsx";
import UserRequestLogs from "./User/History/RequestHistory.jsx";
function App() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("token"); // Check if token is present
  const showSidebar = isAuthenticated && location.pathname !== "/";

  // Route guard for protected routes
  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/" replace />;
  };

  return (
    <div>
      {showSidebar && <Sidebar />} {/* Show Sidebar only when authenticated */}
      <div className={showSidebar ? "home-section" : ""}>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/Dashboard"
            element={<ProtectedRoute element={<Dashboard />} />}
          />
          <Route
            path="/Request"
            element={<ProtectedRoute element={<RequestItems />} />}
          />
          <Route
            path="/Inventory"
            element={<ProtectedRoute element={<Inventory />} />}
          />

          <Route
            path="/Users"
            element={<ProtectedRoute element={<Users />} />}
          />
          <Route
            path="/InventoryTable"
            element={<ProtectedRoute element={<InventoryTable />} />}
          />
          <Route
            path="/BorrowedRequest"
            element={<ProtectedRoute element={<BorrowedRequest />} />}
          />
          <Route
            path="/RequestItem"
            element={<ProtectedRoute element={<RequestItems />} />}
          />
          <Route
            path="/BorrowedTable"
            element={<ProtectedRoute element={<BorrowedItems />} />}
          />

          {/* Asset Section */}
          <Route
            path="/AssetInventory"
            element={<ProtectedRoute element={<AssetInventory />} />}
          />
          <Route
            path="/AssetItemTable"
            element={<ProtectedRoute element={<AssetInvenTable />} />}
          />
          <Route
            path="/Schedule"
            element={<ProtectedRoute element={<Schedule />} />}
          />
          <Route path="/Logs" element={<ProtectedRoute element={<Logs />} />} />

          {/* User Section */}
          <Route
            path="/UserBorrow"
            element={<ProtectedRoute element={<UserBorrow />} />}
          />
          <Route
            path="/UserBorrowStatus"
            element={<ProtectedRoute element={<UserBorrowStatus />} />}
          />
          <Route
            path="/UserRequest"
            element={<ProtectedRoute element={<UserRequestItem />} />}
          />
          <Route
            path="/UserRequestMaintenance"
            element={<ProtectedRoute element={<UserRequestMaintenance />} />}
          />
          <Route
            path="/UserRequestLogs"
            element={<ProtectedRoute element={<UserRequestLogs />} />}
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />
      </div>
    </div>
  );
}

export default App;
