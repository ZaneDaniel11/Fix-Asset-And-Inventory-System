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
import RequestRepair from "./Inventory/Request/RequestRepair.jsx";
import Logs from "./Inventory/Logs/Log.jsx";
import Sidebar from "./Components/Sidebar.jsx";
import BorrowedItems from "./Inventory/Borrowed/BorrowedItems.jsx";
import EmailTest from "./Inventory/Email/email.jsx";

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

// Head Admin Side
import HadminBorrow from "./Head_Admin/Borrow/Borrow.jsx";
import HadminRequestItems from "./Head_Admin/RequestItems/RequestItems.jsx";
import HadminLogs from "./Head_Admin/Logs/Logs.jsx";
function App() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("token"); // Check if token is present
  const usertype = localStorage.getItem("userType"); // Get usertype from localStorage
  const showSidebar = isAuthenticated && location.pathname !== "/";

  // Route guard for protected routes based on usertype
  const ProtectedRoute = ({ element, allowedUsertypes }) => {
    if (!isAuthenticated) return <Navigate to="/" replace />;
    if (!allowedUsertypes.includes(usertype))
      return <Navigate to="/Dashboard" replace />;
    return element;
  };

  return (
    <div>
      {showSidebar && <Sidebar />}
      <div className={showSidebar ? "home-section" : ""}>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Login />} />

          {/* Protected routes */}
          {/* Head Admin */}
          <Route
            path="/HadminBorrow"
            element={
              <ProtectedRoute
                element={<HadminBorrow />}
                allowedUsertypes={["Head_Admin"]}
              />
            }
          />
          <Route
            path="/HadminRequestItems"
            element={
              <ProtectedRoute
                element={<HadminRequestItems />}
                allowedUsertypes={["Head_Admin"]}
              />
            }
          />
          <Route
            path="/HadminLogs"
            element={
              <ProtectedRoute
                element={<HadminLogs />}
                allowedUsertypes={["Head_Admin"]}
              />
            }
          />
          <Route
            path="/Dashboard"
            element={
              <ProtectedRoute
                element={<Dashboard />}
                allowedUsertypes={["Inventory_Admin"]}
              />
            }
          />
          <Route
            path="/Request"
            element={
              <ProtectedRoute
                element={<RequestItems />}
                allowedUsertypes={["Inventory_Admin"]}
              />
            }
          />
          <Route
            path="/Inventory"
            element={
              <ProtectedRoute
                element={<Inventory />}
                allowedUsertypes={["Inventory_Admin"]}
              />
            }
          />
          <Route
            path="/Users"
            element={
              <ProtectedRoute
                element={<Users />}
                allowedUsertypes={["Inventory_Admin"]}
              />
            }
          />
          <Route
            path="/InventoryTable"
            element={
              <ProtectedRoute
                element={<InventoryTable />}
                allowedUsertypes={["Inventory_Admin"]}
              />
            }
          />
          <Route
            path="/BorrowedRequest"
            element={
              <ProtectedRoute
                element={<BorrowedRequest />}
                allowedUsertypes={["Inventory_Admin"]}
              />
            }
          />
          <Route
            path="/RequestItem"
            element={
              <ProtectedRoute
                element={<RequestItems />}
                allowedUsertypes={["Inventory_Admin"]}
              />
            }
          />
          <Route
            path="/RequestRepair"
            element={
              <ProtectedRoute
                element={<RequestRepair />}
                allowedUsertypes={["Inventory_Admin"]}
              />
            }
          />
          <Route
            path="/BorrowedTable"
            element={
              <ProtectedRoute
                element={<BorrowedItems />}
                allowedUsertypes={["Inventory_Admin"]}
              />
            }
          />

          <Route
            path="/Logs"
            element={
              <ProtectedRoute
                element={<Logs />}
                allowedUsertypes={["Inventory_Admin"]}
              />
            }
          />
          <Route
            path="/email"
            element={
              <ProtectedRoute
                element={<EmailTest />}
                allowedUsertypes={["Inventory_Admin"]}
              />
            }
          />

          {/* Asset Section */}
          <Route
            path="/AssetInventory"
            element={
              <ProtectedRoute
                element={<AssetInventory />}
                allowedUsertypes={["Asset_Admin"]}
              />
            }
          />
          <Route
            path="/AssetItemTable"
            element={
              <ProtectedRoute
                element={<AssetInvenTable />}
                allowedUsertypes={["Asset_Admin"]}
              />
            }
          />
          <Route
            path="/Schedule"
            element={
              <ProtectedRoute
                element={<Schedule />}
                allowedUsertypes={["Asset_Admin"]}
              />
            }
          />

          {/* User Section */}
          <Route
            path="/Home"
            element={
              <ProtectedRoute
                element={<UserBorrow />}
                allowedUsertypes={["Member"]}
              />
            }
          />
          <Route
            path="/UserBorrowStatus"
            element={
              <ProtectedRoute
                element={<UserBorrowStatus />}
                allowedUsertypes={["Member"]}
              />
            }
          />
          <Route
            path="/UserRequest"
            element={
              <ProtectedRoute
                element={<UserRequestItem />}
                allowedUsertypes={["Member"]}
              />
            }
          />
          <Route
            path="/UserRequestMaintenance"
            element={
              <ProtectedRoute
                element={<UserRequestMaintenance />}
                allowedUsertypes={["Member"]}
              />
            }
          />
          <Route
            path="/UserRequestLogs"
            element={
              <ProtectedRoute
                element={<UserRequestLogs />}
                allowedUsertypes={["Member"]}
              />
            }
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
