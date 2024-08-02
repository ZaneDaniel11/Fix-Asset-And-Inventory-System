import React from "react";
import { useNavigate } from "react-router-dom";

export default function Head() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/");
  };

  return (
    <>
      <header className="shadow-md font-sans tracking-wide relative z-50">
        <div className="flex flex-wrap items-center justify-between gap-4 px-10 py-4 bg-MainColor min-h-[70px]">
          <a href="javascript:void(0)">Crmc</a>

          <div
            id="collapseMenu"
            className="max-lg:hidden lg:!block max-lg:before:fixed max-lg:before:bg-black max-lg:before:opacity-50 max-lg:before:inset-0 max-lg:before:z-50"
          >
            <ul className="lg:flex lg:gap-x-5 max-lg:space-y-3 max-lg:fixed max-lg:bg-white max-lg:w-1/2 max-lg:min-w-[300px] max-lg:top-0 max-lg:left-0 max-lg:p-6 max-lg:h-full max-lg:shadow-md max-lg:overflow-auto z-50">
              <li className="max-lg:border-b max-lg:py-3 px-3">
                <a
                  href="/home"
                  className="hover:text-[#007bff] text-white block font-bold text-[15px]"
                >
                  Home
                </a>
              </li>
              <li className="max-lg:border-b max-lg:py-3 px-3">
                <a
                  href="/request"
                  className="hover:text-[#007bff] text-white block font-bold text-[15px]"
                >
                  Request
                </a>
              </li>
              <li className="max-lg:border-b max-lg:py-3 px-3">
                <a
                  href="/History"
                  className="hover:text-[#007bff] text-white block font-bold text-[15px]"
                >
                  Request History
                </a>
              </li>
              <li className="max-lg:border-b max-lg:py-3 px-3">
                <a
                  href="#"
                  onClick={handleLogout}
                  className="hover:text-[#007bff] text-white block font-bold text-[15px]"
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
}
