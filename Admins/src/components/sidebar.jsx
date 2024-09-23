import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const Menus = [
    { title: "Logs", icon: "bx bx-book-alt", path: "/logs" },
    {
      title: "Maintenance",
      icon: "fa-solid fa-screwdriver-wrench",
      path: "/maintenance",
    },
    { title: "Borrowed", icon: "fa-solid fa-box-archive", path: "/borrowed" },
  ];

  return (
    <div className="flex">
      <div
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-gray-800 h-screen p-5 pt-8 relative duration-300`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-4 -right-4 w-8 h-8 bg-gray-600 text-white rounded-full focus:outline-none"
        >
          <i
            className={`bx ${isOpen ? "bx-chevron-left" : "bx-chevron-right"}`}
          />
        </button>

        <div className="flex items-center gap-x-4 mb-6">
          <img
            src="/assets/logo.png"
            alt="Logo"
            className={`cursor-pointer duration-300 ${
              isOpen && "rotate-[360deg]"
            }`}
          />
          {isOpen && <h1 className="text-white text-2xl font-bold">My App</h1>}
        </div>

        <ul className="pt-6">
          {Menus.map((menu, index) => (
            <li key={index} className="relative mb-2">
              <Link
                to={menu.path} // Use Link component to navigate
                className={`flex items-center gap-x-4 p-2 cursor-pointer hover:bg-gray-700 text-white rounded-md ${
                  isOpen ? "justify-start" : "justify-center"
                }`}
              >
                <i className={`${menu.icon} text-xl`} />
                {isOpen && <span>{menu.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
