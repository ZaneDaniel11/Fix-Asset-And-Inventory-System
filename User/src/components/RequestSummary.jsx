import React from "react";

const RequestSummary = ({ selectedProducts, onQuantityChange }) => {
  const handleIncrease = (itemID, availableQuantity) => {
    const product = selectedProducts.find((p) => p.itemID === itemID);
    if (product.requestedQuantity < availableQuantity) {
      onQuantityChange(itemID, product.requestedQuantity + 1);
    }
  };

  const handleDecrease = (itemID) => {
    const product = selectedProducts.find((p) => p.itemID === itemID);
    if (product.requestedQuantity > 1) {
      onQuantityChange(itemID, product.requestedQuantity - 1);
    }
  };

  return (
    <div className="w-1/3 bg-gray-50 p-4 rounded-lg shadow-lg block">
      <h2 className="text-xl font-bold mb-4">Request Summary</h2>
      <div className="space-y-4">
        {selectedProducts.map((product) => (
          <div key={product.itemID} className="flex justify-between">
            <span>{product.itemName}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDecrease(product.itemID)}
                className="bg-red-500 text-white px-2 rounded"
              >
                -
              </button>
              <span>{product.requestedQuantity}</span>
              <button
                onClick={() =>
                  handleIncrease(product.itemID, product.initialQuantity)
                }
                className="bg-green-500 text-white px-2 rounded"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Request Button */}
      <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded">
        Request
      </button>
    </div>
  );
};

export default RequestSummary;
