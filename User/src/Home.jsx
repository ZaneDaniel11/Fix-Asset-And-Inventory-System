import React from "react";
import ProductList from "./components/ProductList";
import RequestSummary from "./components/ReqSummary";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <>
      <div className="flex gap-5">
        <Sidebar />
        {/* Main Content */}

        <ProductList />

        <RequestSummary />
      </div>
    </>
  );
}
