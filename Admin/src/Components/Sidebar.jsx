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
    setIsRequestMenuOpen(!isRequestMenuOpen);
    if (!isRequestMenuOpen) setIsBorrowedMenuOpen(false); // Close borrowed menu if open
  };

  const toggleBorrowedMenu = () => {
    setIsBorrowedMenuOpen(!isBorrowedMenuOpen);
    if (!isBorrowedMenuOpen) setIsRequestMenuOpen(false); // Close request menu if open
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
        <span className="logo_name text-white ml-3 font-bold">Fix Asset</span>
      </div>

      {/* Navigation Links */}
      <ul className="nav-links mt-6">
        {usertype === "School_Admin" && (
          <>
            <li>
              <a href="/SadminBorrow" className="flex items-center">
                <i className="bx bx-cart text-xl"></i>
                <span className="link_name">Borrow</span>
              </a>
            </li>
            <li>
              <a href="/SadminRequest" className="flex items-center">
                <i className="bx bx-plus-circle text-xl"></i>
                <span className="link_name">Request Item</span>
              </a>
            </li>

            <li>
              <a href="/SadminLogs" className="flex items-center">
                <i className="bx bx-log text-xl"></i>
                <span className="link_name">Logs</span>
              </a>
            </li>
          </>
        )}
        {usertype === "Head_Admin" && (
          <>
            <li>
              <a href="/HadminBorrow" className="flex items-center">
                <i className="bx bx-cart text-xl"></i>
                <span className="link_name">Borrow</span>
              </a>
            </li>
            <li>
              <a href="/HadminRequestItems" className="flex items-center">
                <i className="bx bx-plus-circle text-xl"></i>
                <span className="link_name">Request Item</span>
              </a>
            </li>
            <li>
              <a href="/HadminMaintenance" className="flex items-center">
                <i className="bx bx-wrench text-xl"></i>
                <span className="link_name">Request Maintenance</span>
              </a>
            </li>
            <li>
              <a href="/HadminLogs" className="flex items-center">
                <i className="bx bx-log text-xl"></i>
                <span className="link_name">Logs</span>
              </a>
            </li>
          </>
        )}

        {usertype === "Member" && (
          <>
            <li>
              <a href="/Home" className="flex items-center">
                <i className="bx bx-cart text-xl"></i>
                <span className="link_name">Borrow</span>
              </a>
            </li>
            <li>
              <a href="/UserBorrowStatus" className="flex items-center">
                <i className="bx bx-history text-xl"></i>
                <span className="link_name">Borrow Status</span>
              </a>
            </li>
            <li>
              <a href="/UserRequest" className="flex items-center">
                <i className="bx bx-plus-circle text-xl"></i>
                <span className="link_name">Request Item</span>
              </a>
            </li>
            <li>
              <a href="/UserRequestMaintenance" className="flex items-center">
                <i className="bx bx-wrench text-xl"></i>
                <span className="link_name">Request Maintenance</span>
              </a>
            </li>
            <li>
              <a href="/UserRequestLogs" className="flex items-center">
                <i className="bx bx-log text-xl"></i>
                <span className="link_name">Logs</span>
              </a>
            </li>
          </>
        )}

        {/* Additional Sections Based on Role */}
        {usertype === "Asset_Admin" && (
          <>
            <li>
              <a href="/AssetInventory" className="flex items-center">
                <i className="bx bx-package text-xl"></i>
                <span className="link_name">Asset Inventory</span>
              </a>
            </li>
            <li>
              <a href="/Schedule" className="flex items-center">
                <i className="bx bx-calendar text-xl"></i>
                <span className="link_name">Schedule</span>
              </a>
            </li>
          </>
        )}

        {usertype === "Inventory_Admin" && (
          <>
            <li>
              <a href="/Dashboard" className="flex items-center">
                <i className="bx bx-home text-xl"></i>
                <span className="link_name">Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/inventory" className="flex items-center">
                <i className="bx bx-box text-xl"></i>
                <span className="link_name">Inventory</span>
              </a>
            </li>

            {/* Request Dropdown */}
            <li>
              <div className="iocn-link flex items-center justify-between">
                <a href="#" className="menu-item flex items-center">
                  <i className="bx bx-collection text-xl"></i>
                  <span className="link_name">Request</span>
                </a>
                <i
                  className={`bx bx-chevron-down ${
                    isRequestMenuOpen ? "rotate" : ""
                  }`}
                  onClick={toggleRequestMenu}
                ></i>
              </div>
              {isRequestMenuOpen && (
                <ul className="sub-menu bg-blue-700 rounded-lg mt-2 p-2">
                  <li>
                    <a href="/BorrowedRequest">Borrow Request</a>
                  </li>
                  <li>
                    <a href="/RequestItem">Request Items</a>
                  </li>
                  <li>
                    <a href="/RequestRepair">Request Repair</a>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <a href="/Users" className="flex items-center">
                <i className="bx bx-user text-xl"></i>
                <span className="link_name">User</span>
              </a>
            </li>

            {/* Borrowed Dropdown */}
            <li>
              <div className="iocn-link flex items-center justify-between">
                <a href="#" className="menu-item flex items-center">
                  <i className="bx bx-archive text-xl"></i>
                  <span className="link_name">Borrowed</span>
                </a>
                <i
                  className={`bx bx-chevron-down ${
                    isBorrowedMenuOpen ? "rotate" : ""
                  }`}
                  onClick={toggleBorrowedMenu}
                ></i>
              </div>
              {isBorrowedMenuOpen && (
                <ul className="sub-menu bg-blue-700 rounded-lg mt-2 p-2">
                  <li>
                    <a href="/BorrowedTable">Borrowed Items</a>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <a href="/Logs" className="flex items-center">
                <i className="bx bx-history text-xl"></i>
                <span className="link_name">Logs</span>
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
