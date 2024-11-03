import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../Css/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isSidebarClosed, setIsSidebarClosed] = useState(false); // Set to false for open by default
  const [isRequestMenuOpen, setIsRequestMenuOpen] = useState(false);
  const [isBorrowedMenuOpen, setIsBorrowedMenuOpen] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);
  
  // ... rest of the code remains the same

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
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
    <div className={`sidebar ${isSidebarClosed ? "close" : ""}`}>
      <div className="logo-details">
        <i
          className="bx bxl-c-plus-plus bx-menu"
          id="sidebar-toggle"
          onClick={toggleSidebar}
        ></i>
        <span className="logo_name">Fix Asset</span>
      </div>
      <ul className="nav-links">
        <li>
          <a href="/AssetInventory">
            <i className="fa-solid fa-boxes-stacked"></i>
            <span className="link_name">Asset Inventory</span>
          </a>
        </li>
        <li>
          <a href="/">
            <i className="bx bx-grid-alt"></i>
            <span className="link_name">Dashboard</span>
          </a>
        </li>
        <li>
          <a href="/inventory">
            <i className="fa-solid fa-boxes-stacked"></i>
            <span className="link_name">Inventory</span>
          </a>
        </li>

        {/* Request Menu */}
        <li>
          <div className="iocn-link" onClick={toggleRequestMenu}>
            <a href="#" className="menu-item">
              <i className="bx bx-collection"></i>
              <span className="link_name">Request</span>
            </a>
            <i
              className={`bx bxs-chevron-down arrow ${
                isRequestMenuOpen ? "rotate" : ""
              }`}
            ></i>
          </div>
          <ul className={`sub-menu ${isRequestMenuOpen ? "show" : ""}`}>
            <li>
              <a href="#">Request</a>
            </li>
            <li>
              <a href="/BorrowedRequest">Borrow Request</a>
            </li>
            <li>
              <a href="/RequestItem">Request Items</a>
            </li>
            <li>
              <a href="/Request">Request Repair</a>
            </li>
          </ul>
        </li>

        <li>
          <a href="/Users">
            <i className="fa-regular fa-user"></i>
            <span className="link_name">User</span>
          </a>
        </li>

        {/* Borrowed Menu */}
        <li>
          <div className="iocn-link" onClick={toggleBorrowedMenu}>
            <a href="#" className="menu-item">
              <i className="fa-solid fa-box-archive"></i>
              <span className="link_name">Borrowed</span>
            </a>
            <i
              className={`bx bxs-chevron-down arrow ${
                isBorrowedMenuOpen ? "rotate" : ""
              }`}
            ></i>
          </div>
          <ul className={`sub-menu ${isBorrowedMenuOpen ? "show" : ""}`}>
            <li>
              <a href="#">Borrowed</a>
            </li>
            <li>
              <a href="/BorrowedTable">Borrowed Items</a>
            </li>
          </ul>
        </li>

        <li>
          <a href="/Logs">
            <i className="fa-regular fa-user"></i>
            <span className="link_name">Logs</span>
          </a>
        </li>
        <li>
          <div className="profile-details">
            <div className="name-job">
              <div className="profile_name">{username || "Zane Daniel"}</div>
              <div className="job">Admin</div>
            </div>
            <i className="bx bx-log-out" onClick={handleLogout}></i>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
