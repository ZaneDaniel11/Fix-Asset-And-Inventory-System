import React from "react";

const RequestSummary = () => {
  return (
    <div className="w-1/3 bg-gray-50 p-4 rounded-lg shadow-lg block">
      <h2 className="text-xl font-bold mb-4">Request Summary</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Original Cheese Burger</span>
          <span>$12.99</span>
        </div>
        <div className="flex justify-between">
          <span>Fresh Orange Juice</span>
          <span>$3.99</span>
        </div>
        <div className="flex justify-between">
          <span>Taco Salad</span>
          <span>$9.99</span>
        </div>
        <hr className="my-4" />
        <div className="flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span>$26.97</span>
        </div>
      </div>
      <button className="mt-4 w-full bg-green-500 text-white py-2 rounded">
        Request
      </button>
    </div>
  );
};

export default RequestSummary;
