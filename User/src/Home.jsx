import React from "react";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import RequestSummary from "./components/ReqSummary"; // Notice consistent naming

export default function Home() {
  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-gray-100 p-5">
          <Navbar />
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4 bg-white p-5 overflow-auto">
          <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-5">
            <ProductList />
            <RequestSummary />
          </div>
        </div>
      </div>
    </>
  );
}
