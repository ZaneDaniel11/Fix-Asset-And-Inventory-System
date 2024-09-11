import React, { useState } from "react";
import {
  HiMenuAlt1,
  HiX,
  HiHome,
  HiUser,
  HiCog,
  HiLogout,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "w-64" : "w-20"
        } h-screen bg-gray-800 text-white transition-all duration-300`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4">
          <h1
            className={`text-xl font-bold ${
              isOpen ? "block" : "hidden"
            } transition-all`}
          >
            Sidebar
          </h1>
          <button onClick={toggleSidebar} className="focus:outline-none">
            {isOpen ? <HiX size={24} /> : <HiMenuAlt1 size={24} />}
          </button>
        </div>

        {/* Sidebar Items */}
        <nav className="mt-10">
          <ul>
            <li className="flex items-center p-2 hover:bg-gray-700 cursor-pointer">
              <HiHome size={24} />
              <span
                className={`ml-4 text-lg ${
                  isOpen ? "block" : "hidden"
                } transition-all`}
              >
                Home
              </span>
            </li>
            <li className="flex items-center p-2 hover:bg-gray-700 cursor-pointer">
              <HiUser size={24} />
              <span
                className={`ml-4 text-lg ${
                  isOpen ? "block" : "hidden"
                } transition-all`}
              >
                Request
              </span>
            </li>
            <a href="/request">
              <li className="flex items-center p-2 hover:bg-gray-700 cursor-pointer">
                <HiCog size={24} />
                <span
                  className={`ml-4 text-lg ${
                    isOpen ? "block" : "hidden"
                  } transition-all`}
                >
                  Request History
                </span>
              </li>
            </a>
            <li
              className="flex items-center p-2 hover:bg-gray-700 cursor-pointer"
              onClick={handleLogout}
            >
              <HiLogout size={24} />
              <span
                className={`ml-4 text-lg ${
                  isOpen ? "block" : "hidden"
                } transition-all`}
              >
                Logout
              </span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      {/* <div className="flex-1 p-8 bg-gray-100">
        <h1 className="text-2xl font-bold">Main Content</h1>
        <p>This is the main content area.</p>
      </div> */}
    </div>
  );
}
