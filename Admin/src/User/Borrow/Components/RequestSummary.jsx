import React, { useState } from "react";
import { toast } from "react-toastify";

const RequestSummary = ({
  selectedProducts,
  onQuantityChange,
  onRemoveProduct,
  onRequestCompleted,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [priority, setPriority] = useState("");

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const handleSave = async () => {
    const loggedInUsername = localStorage.getItem("name");
    const borrowerId = localStorage.getItem("userId");

    if (!borrowerId) {
      alert("User is not logged in. Please log in again.");
      return;
    }

    const requestPayload = {
      requestedBy: loggedInUsername || "Unknown",
      borrowerId: parseInt(borrowerId),
      purpose,
      status: "Pending",
      priority,
      items: selectedProducts.map((product) => ({
        itemName: product.itemName,
        quantity: product.requestedQuantity,
        itemID: product.itemID,
        categoryID: product.categoryID,
      })),
    };

    try {
      const response = await fetch(
        "http://localhost:5075/api/BorrowRequestApi/Request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        }
      );

      if (response.ok) {
        onRequestCompleted();
        toast.success("Borrow request submitted successfully!");
        setPurpose("");
        setPriority("");
        closeModal();
      } else {
        console.error("Error submitting request:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };

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

  const handleRemove = (itemID) => onRemoveProduct(itemID);

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-lg block">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Borrow Summary
      </h2>
      <div className="space-y-4">
        {selectedProducts.map((product) => (
          <div
            key={product.itemID}
            className="flex items-center border p-4 rounded-lg shadow-md bg-gray-100 space-x-4"
          >
            <div className="flex-shrink-0">
              <img
                src="https://via.placeholder.com/100"
                alt={product.itemName}
                className="w-20 h-20 object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 relative">
              <button
                onClick={() => handleRemove(product.itemID)}
                className="absolute top-0 right-0 text-red-500 hover:text-red-600 text-lg transition"
              >
                ✕
              </button>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {product.itemName}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Quantity:{" "}
                <span className="font-medium">{product.requestedQuantity}</span>
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleDecrease(product.itemID)}
                  className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full text-xl flex justify-center items-center transition"
                >
                  -
                </button>
                <span className="text-xl font-semibold text-gray-800">
                  {product.requestedQuantity}
                </span>
                <button
                  onClick={() =>
                    handleIncrease(product.itemID, product.initialQuantity)
                  }
                  className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full text-xl flex justify-center items-center transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={openModal}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-lg shadow-md transition transform hover:scale-105"
      >
        Request
      </button>

      {/* Modal Section */}
      {modalIsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-8 w-full max-w-md rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center border-b pb-4">
              Submit Borrow Request
            </h2>
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (!purpose.trim()) {
                  alert("Purpose is required");
                  return;
                }
                handleSave();
              }}
            >
              <div>
                <label
                  htmlFor="purpose"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none text-gray-800"
                  placeholder="Enter the purpose"
                />
              </div>
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none text-gray-800"
                >
                  <option value="">Select Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium px-5 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg shadow-md transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestSummary;
