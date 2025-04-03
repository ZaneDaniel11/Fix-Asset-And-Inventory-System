import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../Css/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const [isSidebarClosed, setIsSidebarClosed] = useState(false);
  const [usertype, setUsertype] = useState("");
  const [isRequestMenuOpen, setIsRequestMenuOpen] = useState(false);
  const [isBorrowedMenuOpen, setIsBorrowedMenuOpen] = useState(false);

  const storedName = localStorage.getItem("name");
  useEffect(() => {
    const storedUsertype = localStorage.getItem("userType");

    if (storedUsertype) setUsertype(storedUsertype);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("usertype");
    navigate("/");
  };

  const toggleSidebar = () => setIsSidebarClosed(!isSidebarClosed);

  const toggleRequestMenu = () => {
    setIsRequestMenuOpen((prev) => !prev);
  };
  const toggleBorrowedMenu = () => {
    if (!isSidebarClosed) {
      setIsBorrowedMenuOpen((prev) => !prev);
      setIsRequestMenuOpen(false); // Ensure Request menu is closed
    }
  };
  return (
    <div
      className={`sidebar bg-gradient-to-b BlackNgadiliBlack ${
        isSidebarClosed ? "close" : ""
      }`}
    >
      {/* Logo Section */}
      <div className="logo-details flex items-center p-4">
        <i
          className="bx bx-menu text-white cursor-pointer"
          onClick={toggleSidebar}
        ></i>
        <span className="logo_name text-white ml-3 font-bold">Capstone</span>
      </div>

      {/* Navigation Links */}
      <ul className="nav-links mt-6">
        {usertype === "School_Admin" && (
          <>
            <li>
              <a href="/SadminBorrow" className="flex items-center">
                <i className="bx bx-cart text-xl"></i>
                <span className="text-white">Borrow</span>
              </a>
            </li>
            <li>
              <a href="/SadminRequest" className="flex items-center">
                <i className="bx bx-plus-circle text-xl"></i>
                <span className="text-white">Request Item</span>
              </a>
            </li>

            <li>
              <a href="/SadminLogs" className="flex items-center">
                <i className="bx bx-log text-xl"></i>
                <span className="text-white">Logs</span>
              </a>
            </li>
          </>
        )}
        {usertype === "Head_Admin" && (
          <>
            <li>
              <a href="/HadminBorrow" className="flex items-center">
                <i className="bx bx-cart text-xl"></i>
                <span className="text-white">Borrow</span>
              </a>
            </li>
            <li>
              <a href="/HadminRequestItems" className="flex items-center">
                <i className="bx bx-plus-circle text-xl"></i>
                <span className="text-white">Request Item</span>
              </a>
            </li>
            <li>
              <a href="/HadminMaintenance" className="flex items-center">
                <i className="bx bx-wrench text-xl"></i>
                <span className="text-white">Request Maintenance</span>
              </a>
            </li>
            <li>
              <a href="/HadminLogs" className="flex items-center">
                <i className="bx bx-log text-xl"></i>
                <span className="text-white">Logs</span>
              </a>
            </li>
          </>
        )}

        {(usertype === "Department" || usertype === "Teacher") && (
          <>
            <li>
              <a href="/Home" className="flex items-center">
                <i className="bx bx-cart text-xl"></i>
                <span className="text-white">Borrow</span>
              </a>
            </li>
            <li>
              <a href="/UserBorrowStatus" className="flex items-center">
                <i className="bx bx-history text-xl"></i>
                <span className="text-white">Borrow Status</span>
              </a>
            </li>
            <li>
              <a href="/UserRequest" className="flex items-center">
                <i className="bx bx-plus-circle text-xl"></i>
                <span className="text-white">Request Item</span>
              </a>
            </li>
          
            <li>
              <a href="/UserRequestLogs" className="flex items-center">
                <i className="bx bx-log text-xl"></i>
           {/* # */}
              </a>
            </li>
          </>
        )}

        {/* Additional Sections Based on Role d*/}
        {usertype === "Asset_Admin" && (
          <>
            <li>
              <a href="/AssetInventory" className="flex items-center">
                <i className="bx bx-package text-xl"></i>
                
                <span className="text-white">Asset Inventory</span>
              </a>
            </li>
            <li>
              <a href="/Schedule" className="flex items-center">
                <i className="bx bx-calendar text-xl"></i>
                <span className="text-white">Schedule</span>
              </a>
            </li>
            <li>
              <a href="/Reports" className="flex items-center">
                <i className="bx bx-calendar text-xl"></i>
                <span className="text-white">Reports</span>
              </a>
            </li>
            <li>
              <a href="/Disposed" className="flex items-center">
                <i className="bx bx-calendar text-xl"></i>
                <span className="text-white">Disosed</span>
              </a>
            </li>
          </>
        )}

        {usertype === "Inventory_Admin" && (
          <>
            <li>
              <a href="/Dashboard" className="flex items-center">
                <i className="bx bx-home text-xl"></i>
                <span className="text-white">Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/inventory" className="flex items-center">
                <i className="bx bx-box text-xl"></i>
                <span className="text-white">Inventory</span>
              </a>
            </li>

            {/* Request Dropdown */}
            <li className=" text-white">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={toggleRequestMenu}
              >
                <div className="flex items-center">
                  <i className="bx bx-collection text-xl"></i>
                  <span
                    className={`text-white ${isSidebarClosed ? "hidden" : ""}`}
                  >
                    Request
                  </span>
                </div>
                {!isSidebarClosed && (
                  <i
                    className={`bx bx-chevron-down transition-transform duration-300 ${
                      isRequestMenuOpen ? "rotate-180" : ""
                    }`}
                  ></i>
                )}
              </div>
            </li>
            {!isSidebarClosed && isRequestMenuOpen && (
              <>
                <li className="pl-8">
                  <a href="/BorrowedRequest" className="flex items-center">
                    <i className="bx bx-cart text-sm"></i>
                    <span className="text-white">Borrow Request</span>
                  </a>
                </li>
                <li className="pl-8">
                  <a href="/RequestItem" className="flex items-center">
                    <i className="bx bx-box text-sm"></i>
                    <span className="text-white">Request Items</span>
                  </a>
                </li>
                <li className="pl-8">
                  <a href="/RequestRepair" className="flex items-center">
                    <i className="bx bx-wrench text-sm"></i>
                    <span className="text-white">Request Repair</span>
                  </a>
                </li>
              </>
            )}
            <li>
              <a href="/Users" className="flex items-center">
                <i className="bx bx-user text-xl"></i>
                <span className="text-white">User</span>
              </a>
            </li>

            {/* Borrowed Dropdown */}
            <li className="text-white">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={toggleBorrowedMenu}
              >
                <div className="flex items-center">
                  <i className="bx bx-archive text-xl"></i>
                  <span
                    className={`text-white ${isSidebarClosed ? "hidden" : ""}`}
                  >
                    Borrowed
                  </span>
                </div>
                {!isSidebarClosed && (
                  <i
                    className={`bx bx-chevron-down transition-transform duration-300 ${
                      isBorrowedMenuOpen ? "rotate-180" : ""
                    }`}
                  ></i>
                )}
              </div>
            </li>
            {!isSidebarClosed && isBorrowedMenuOpen && (
              <>
                <li className="pl-8">
                  <a href="/BorrowedTable" className="flex items-center">
                    <i className="bx bx-book text-sm"></i>
                    <span className="text-white">Borrowed Items</span>
                  </a>
                </li>
                <li className="pl-8">
                  <a href="/ReturedItems" className="flex items-center">
                    <i className="bx bx-undo text-sm"></i>
                    <span className="text-white">Return Items</span>
                  </a>
                </li>
              </>
            )}

            <li>
              <a href="/Logs" className="flex items-center">
                <i className="bx bx-history text-xl"></i>
                <span className="text-white">Logs</span>
              </a>
            </li>
              <li>
              <a href="/Approved" className="flex items-center">
                <i className="bx bx-history text-xl"></i>
                <span className="text-white">Approved</span>
              </a>
            </li>
          </>
        )}

        {/* Profile Section */}
        <li className="mt-auto">
          <div className="profile-details flex items-center p-4 bg-gray-100 rounded-lg">
            <div className="avatar bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center text-white text-lg font-bold">
              {storedName?.charAt(0) || "U"}
            </div>
            <div className="ml-3">
              <div className="profile_name font-semibold text-gray-800">
                {storedName || "User"}
              </div>
              <div className="job text-sm text-gray-600">{usertype}</div>
            </div>
            <i
              className="bx bx-log-out ml-auto text-red-600 cursor-pointer"
              onClick={handleLogout}
            ></i>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
