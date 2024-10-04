import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate from react-router-dom

import Logo from "../Assets/Logo.png"; // Path to the logo

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [userType, setUserType] = useState("");
  const navigate = useNavigate(); // Use navigate for redirection

  useEffect(() => {
    // Retrieve the userType from localStorage
    const storedUserType = localStorage.getItem("userType");
    setUserType(storedUserType);
  }, []);

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear();
    // Redirect to the login page
    navigate("/");
  };

  // Menu items with userType-specific visibility
  const Menus = [
    {
      title: "Borrow",
      icon: "bx bx-book-alt",
      path: "/home",
      visibleTo: ["Senior_Admin"],
    },
    {
      title: "SuperBorrow",
      icon: "bx bx-book-reader",
      path: "/SuperBorrow",
      visibleTo: ["Head_Admin"],
    },
    {
      title: "Logs",
      icon: "bx bx-list-ul",
      path: "/Logs",
      visibleTo: ["Senior_Admin"],
    },
    {
      title: "SuperLogs",
      icon: "bx bx-clipboard",
      path: "/SuperLogs",
      visibleTo: ["Head_Admin"],
    },
    {
      title: "Maintenance",
      icon: "fas fa-screwdriver-wrench",
      path: "/maintenance",
      visibleTo: ["Senior_Admin"],
    },
    {
      title: "Borrowed",
      icon: "fas fa-box-archive",
      path: "/borrowed",
      visibleTo: ["Senior_Admin"],
    },
    {
      title: "Request",
      icon: "fas fa-box-archive",
      path: "/Request",
      visibleTo: ["Senior_Admin"],
    },
    {
      title: "SuperRequest",
      icon: "fas fa-box-archive",
      path: "/SuperRequest",
      visibleTo: ["Head_Admin"],
    },
    {
      title: "Logout", // New Logout item
      icon: "bx bx-log-out",
      path: "#",
      visibleTo: ["Senior_Admin", "Head_Admin"],
      action: handleLogout, // Link the logout action
    },
  ];

  return (
    <div className="flex">
      <div
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-MainColor h-screen p-5 pt-8 relative duration-300`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-4 -right-4 w-8 h-8 bg-HoverSide text-white rounded-full focus:outline-none"
        >
          <i
            className={`bx ${isOpen ? "bx-chevron-left" : "bx-chevron-right"}`}
          />
        </button>

        <div className="flex items-center gap-x-4 mb-6">
          <img
            src={Logo} // Path to your logo
            alt="CRMC Logo"
            style={{
              width: isOpen ? "100px" : "50px", // Adjust width based on sidebar state
              height: isOpen ? "70px" : "30px", // Adjust height based on sidebar state
            }}
            className={`cursor-pointer duration-300 ${
              isOpen && "rotate-[360deg]"
            }`}
          />
          {isOpen && <h1 className="text-white text-2xl font-bold">CRMC</h1>}
        </div>

        <ul className="pt-6">
          {Menus.filter((menu) => menu.visibleTo.includes(userType)).map(
            (menu, index) => (
              <li key={index} className="relative mb-2">
                {menu.action ? ( // Check if the menu has an action (for logout)
                  <button
                    onClick={menu.action}
                    className={`flex items-center gap-x-4 p-2 cursor-pointer hover:bg-HoverSide text-white rounded-md ${
                      isOpen ? "justify-start" : "justify-center"
                    }`}
                  >
                    <i className={`${menu.icon} text-xl`} />
                    {isOpen && <span>{menu.title}</span>}
                  </button>
                ) : (
                  <Link
                    to={menu.path} // Use Link component to navigate
                    className={`flex items-center gap-x-4 p-2 cursor-pointer hover:bg-HoverSide text-white rounded-md ${
                      isOpen ? "justify-start" : "justify-center"
                    }`}
                  >
                    <i className={`${menu.icon} text-xl`} />
                    {isOpen && <span>{menu.title}</span>}
                  </Link>
                )}
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
