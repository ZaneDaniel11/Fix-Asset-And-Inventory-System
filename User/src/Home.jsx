import React from "react";
import ProductList from "./components/ProductList";
import RequestSummary from "./components/ReqSummary";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
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
