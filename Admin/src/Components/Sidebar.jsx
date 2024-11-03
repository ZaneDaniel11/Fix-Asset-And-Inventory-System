import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../Css/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Retrieve the username from localStorage (assuming it's stored under "username")
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    const arrowElements = document.querySelectorAll(".arrow");
    const sidebar = document.querySelector(".sidebar");
    const sidebarBtn = document.querySelector(".bx-menu");

    arrowElements.forEach((arrow) => {
      arrow.addEventListener("click", (e) => {
        let arrowParent = e.target.closest(".iocn-link"); // select the main parent of arrow
        arrowParent.classList.toggle("showMenu");
      });
    });

    if (sidebarBtn) {
      sidebarBtn.addEventListener("click", () => {
        sidebar.classList.toggle("close");
      });
    }

    const handleLogout = () => {
      localStorage.removeItem("token"); // Remove the token from local storage
      localStorage.removeItem("username"); // Remove the username from local storage
      navigate("/"); // Redirect to the login page
    };

    // Clean up event listeners on component unmount
    return () => {
      arrowElements.forEach((arrow) => {
        arrow.removeEventListener("click", (e) => {
          let arrowParent = e.target.closest(".iocn-link");
          arrowParent.classList.toggle("showMenu");
        });
      });
      if (sidebarBtn) {
        sidebarBtn.removeEventListener("click", () => {
          sidebar.classList.toggle("close");
        });
      }
    };
  }, [navigate]);

  return (
    <div className="sidebar close">
      <div className="logo-details">
        <i className="bx bxl-c-plus-plus bx-menu" id="sidebar-toggle"></i>
        <span className="logo_name">Fix Asset</span>
      </div>
      <ul className="nav-links">
        <li>
          <a href="/AssetInventory">
            <i className="fa-solid fa-boxes-stacked"></i>
            <span className="link_name">Asset Inventory</span>
          </a>
          <ul className="sub-menu blank">
            <li>
              <a className="link_name" href="#">
                Asset Inventory
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="/">
            <i className="bx bx-grid-alt"></i>
            <span className="link_name">Dashboard</span>
          </a>
          <ul className="sub-menu blank">
            <li>
              <a className="link_name" href="#">
                Dashboard
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="/inventory">
            <i className="fa-solid fa-boxes-stacked"></i>
            <span className="link_name">Inventory</span>
          </a>
          <ul className="sub-menu blank">
            <li>
              <a className="link_name" href="#">
                Inventory
              </a>
            </li>
          </ul>
        </li>
        <li>
          <div className="iocn-link">
            <a href="/Request">
              <i className="bx bx-collection"></i>
              <span className="link_name">Request</span>
            </a>
            <i className="bx bxs-chevron-down arrow"></i>
          </div>
          <ul className="sub-menu">
            <li>
              <a className="link_name" href="#">
                Request
              </a>
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
          <ul className="sub-menu blank">
            <li>
              <a className="link_name" href="#">
                User
              </a>
            </li>
          </ul>
        </li>
        <li>
          <div className="iocn-link">
            <a href="/BorrowedTable">
              <i className="fa-solid fa-box-archive"></i>
              <span className="link_name">Borrowed</span>
            </a>
            <i className="bx bxs-chevron-down arrow"></i>
          </div>
          <ul className="sub-menu">
            <li>
              <a className="link_name" href="#">
                Borrowed
              </a>
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
          <ul className="sub-menu blank">
            <li>
              <a className="link_name" href="#">
                Logs
              </a>
            </li>
          </ul>
        </li>

        <li>
          <div className="profile-details">
            <div className="profile-content"></div>
            <div className="name-job">
              <div className="profile_name">{username || "Zane Daniel"}</div>
              <div className="job">Admin</div>
            </div>
            <i className="bx bx-log-out" onClick={() => handleLogout()}></i>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
