import React from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Login.jsx";
import Users from "./Inventory_Admin/User/User.jsx";
import Inventory from "./Inventory_Admin/Inventory/Inventory.jsx";
import Dashboard from "./Inventory_Admin/Dashboard/Dashboard.jsx";
import InventoryTable from "./Inventory_Admin/Inventory/Components/Table/Inventory_table.jsx";
import BorrowedRequest from "./Inventory_Admin/Request/BorrowRequest.jsx";
import RequestItems from "./Inventory_Admin/Request/RequestItems.jsx";
import RequestRepair from "./Inventory_Admin/Request/RequestRepair.jsx";
import Logs from "./Inventory_Admin/Inventory_Logs/Inventory_Logs.jsx";
import Sidebar from "./Components/Sidebar.jsx";
import BorrowedItems from "./Inventory_Admin/Borrowed/BorrowedItems.jsx";
import ReturedItems from "./Inventory_Admin/Borrowed/ReturnedItems.jsx";
import Approved from "./Inventory_Admin/Approved/Approved.jsx"

// Asset Admin
import AssetInventory from "./Asset/Inventory/AInventory.jsx";
import AssetInvenTable from "./Asset/Inventory/Components/CategoryItem/InventoryItemTable.jsx";
import Schedule from "./Asset/Schedule/Schedule.jsx";
import Reports from "./Asset/Report/AssetReport.jsx";
import Disposed from "./Asset/Disposed/Disposed-assets-dashboard.jsx"
import { ToastContainer } from "react-toastify";

// User Side
import UserBorrow from "./User/Borrow/Borrow.jsx";
import UserBorrowStatus from "./User/BorrowStatus/Borrows.jsx";
import UserRequestItem from "./User/Request/Request.jsx";
import UserRequestMaintenance from "./User/Maintenance/Maintenance.jsx";
import UserRequestLogs from "./User/History/RequestHistory.jsx";

// Head Admin Side
import HadminBorrow from "./Head_Admin/Borrow/Head_Borrow.jsx";
import HadminRequestItems from "./Head_Admin/RequestItems/Head_RequestItems.jsx";
import HadminLogs from "./Head_Admin/Head_Logs/Head_Logs.jsx";
import HadminMaintenance from "./Head_Admin/MaintenanceRequest/MaintenanceReq.jsx";

// School Admin
import SadminBorrow from "./School_Admin/Borrow/SuperBorrow.jsx";
import SadminRequest from "./School_Admin/RequestItems/SuperRequestItems.jsx";
import SadminLogs from "./School_Admin/Super_Logs/SuperLogs.jsx";


// import NewMainPage from "./Mainpage/NewMainPage.jsx";
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
          {/* <Route path="/NewMainPage" element={<NewMainPage />} /> */}
        
         

          {/* Protected routes */}
          {/* Schoo Admin */}
          <Route
            path="/SadminBorrow"
            element={
              <ProtectedRoute
                element={<SadminBorrow />}
                allowedUsertypes={["School_Admin"]}
              />
            }
          />
          <Route
            path="/SadminRequest"
            element={
              <ProtectedRoute
                element={<SadminRequest />}
                allowedUsertypes={["School_Admin"]}
              />
            }
          />
          <Route
            path="/SadminLogs"
            element={
              <ProtectedRoute
                element={<SadminLogs />}
                allowedUsertypes={["School_Admin"]}
              />
            }
          />
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
            path="/HadminMaintenance"
            element={
              <ProtectedRoute
                element={<HadminMaintenance />}
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
            path="/ReturedItems"
            element={
              <ProtectedRoute
                element={<ReturedItems />}
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
            path="/Approved"
            element={
              <ProtectedRoute
                element={<Approved />}
                allowedUsertypes={["Inventory_Admin"]}
              />
            }
          />

          {/* Asset Section */}
          <Route
            path="/Disposed"
            element={
              <ProtectedRoute
                element={<Disposed />}
                allowedUsertypes={["Asset_Admin"]}
              />
            }
          />
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
            path="/Reports"
            element={
              <ProtectedRoute
                element={<Reports />}
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
                allowedUsertypes={["Department", "Teacher"]}
              />
            }
          />
          <Route
            path="/UserBorrowStatus"
            element={
              <ProtectedRoute
                element={<UserBorrowStatus />}
                allowedUsertypes={["Department", "Teacher"]}
              />
            }
          />
          <Route
            path="/UserRequest"
            element={
              <ProtectedRoute
                element={<UserRequestItem />}
                allowedUsertypes={["Department", "Teacher"]}
              />
            }
          />
          <Route
            path="/UserRequestMaintenance"
            element={
              <ProtectedRoute
                element={<UserRequestMaintenance />}
                allowedUsertypes={["Department"]}
              />
            }
          />
          <Route
            path="/UserRequestLogs"
            element={
              <ProtectedRoute
                element={<UserRequestLogs />}
                allowedUsertypes={["Department", "Teacher"]}
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
