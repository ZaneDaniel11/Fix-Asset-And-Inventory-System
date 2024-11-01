import React from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import Login from "./Login.jsx";
import Maintenance from "./Tables/Maintenance.jsx";
import Users from "./Tables/User.jsx";
import Inventory from "./Inventory.jsx";
import Dashboard from "./Dashboard.jsx";
import Inventory_table from "./Tables/Inventory_table.jsx";
import BorrowedRequest from "./Request/BorrowRequest.jsx";
import RequestItems from "./Request/RequestItems.jsx";
import Sidebar from "./Components/Sidebar.jsx";
import BorrowedItems from "./Borrowed/BorrowedItems/BorrowedItems.jsx";

// Asset Admin
import AssetInventory from "./Asset/Inventory/AInventory.jsx";
import AssetInvenTable from "./Asset/Inventory/Components/CategoryItem/InventoryItemTable.jsx";

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
            path="/Maintenance"
            element={<ProtectedRoute element={<Maintenance />} />}
          />
          <Route
            path="/Users"
            element={<ProtectedRoute element={<Users />} />}
          />
          <Route
            path="/InventoryTable"
            element={<ProtectedRoute element={<Inventory_table />} />}
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
        </Routes>
      </div>
    </div>
  );
}

export default App;
