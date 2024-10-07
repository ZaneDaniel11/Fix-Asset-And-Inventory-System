import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Assets/Logo.png"; // Path to the logo

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();

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

  const Menus = [
    {
      title: "Borrow Request",
      icon: "bx bx-book-alt",
      path: "/home",
      visibleTo: ["Senior_Admin"],
    },
    {
      title: "Item Request",
      icon: "fas fa-box-archive",
      path: "/Request",
      visibleTo: ["Senior_Admin"],
    },
    {
      title: "SuperBorrow",
      icon: "bx bx-book-reader",
      path: "/SuperBorrow",
      visibleTo: ["Head_Admin"],
    },
    {
      title: "Maintenance Request",
      icon: "fas fa-screwdriver-wrench",
      path: "/maintenance",
      visibleTo: ["Senior_Admin"],
    },
    {
      title: "Logs",
      icon: "bx bx-list-ul",
      path: "/Logs",
      visibleTo: ["Senior_Admin"],
    },

    {
      title: "SuperRequest",
      icon: "fas fa-box-archive",
      path: "/SuperRequest",
      visibleTo: ["Head_Admin"],
    },
    {
      title: "SuperLogs",
      icon: "bx bx-clipboard",
      path: "/SuperLogs",
      visibleTo: ["Head_Admin"],
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      {" "}
      {/* Use full height */}
      {/* Sidebar content (Menu) */}
      <div
        className={`bg-MainColor p-5 pt-2 flex-1 relative duration-300 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-2 -right-4 w-8 h-8 bg-HoverSide text-white rounded-full focus:outline-none"
        >
          <i
            className={`bx ${isOpen ? "bx-chevron-left" : "bx-chevron-right"}`}
          />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-x-4 mb-6">
          <img
            src={Logo} // Path to your logo
            alt="CRMC Logo"
            style={{
              width: isOpen ? "100px" : "50px",
              height: isOpen ? "70px" : "30px",
            }}
            className={`cursor-pointer duration-300 ${
              isOpen && "rotate-[360deg]"
            }`}
          />
          {isOpen && <h1 className="text-white text-2xl font-bold">CRMC</h1>}
        </div>

        {/* Menu items */}
        <ul className="pt-6">
          {Menus.filter((menu) => menu.visibleTo.includes(userType)).map(
            (menu, index) => (
              <li key={index} className="relative mb-2">
                <Link
                  to={menu.path}
                  className={`flex items-center gap-x-4 p-2 cursor-pointer hover:bg-HoverSide text-white rounded-md ${
                    isOpen ? "justify-start" : "justify-center"
                  }`}
                >
                  <i className={`${menu.icon} text-xl`} />
                  {isOpen && <span>{menu.title}</span>}
                </Link>
              </li>
            )
          )}
        </ul>
      </div>
      {/* Bottom section (Logout and UserType) */}
      <div className="bg-MainColor p-4 flex justify-between items-center">
        {isOpen && <span className="text-white text-xl">{userType}</span>}
        <button
          onClick={handleLogout}
          className="flex items-center gap-x-2 p-2 cursor-pointer hover:bg-HoverSide text-white rounded-md"
        >
          <i className="bx bx-log-out text-xl" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
