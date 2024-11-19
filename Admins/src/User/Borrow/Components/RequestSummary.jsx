import React, { useState } from "react";
import Modal from "react-modal";

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
    const loggedInUsername = localStorage.getItem("username");
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
      } else {
        console.error("Error submitting request:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
    }

    closeModal();
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
    <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Borrow Summary
      </h2>
      <div className="space-y-4">
        {selectedProducts.map((product) => (
          <div
            key={product.itemID}
            className="flex items-center border p-4 rounded-lg shadow-md bg-gray-100 space-x-6"
          >
            {/* Image Section */}
            <div className="flex-shrink-0">
              <img
                src="https://via.placeholder.com/100"
                alt={product.itemName}
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>

            {/* Content Section */}
            <div className="flex-1 relative">
              {/* Remove Button */}
              <button
                onClick={() => handleRemove(product.itemID)}
                className="absolute top-0 right-0 text-red-500 hover:text-red-600 text-lg"
              >
                ✕
              </button>

              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {product.itemName}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Quantity:{" "}
                <span className="font-medium">{product.requestedQuantity}</span>
              </p>

              <div className="flex items-center space-x-4">
                {/* Decrement Button */}
                <button
                  onClick={() => handleDecrease(product.itemID)}
                  className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full text-xl flex justify-center items-center"
                >
                  -
                </button>

                {/* Quantity Display */}
                <span className="text-xl font-medium text-gray-800">
                  {product.requestedQuantity}
                </span>

                {/* Increment Button */}
                <button
                  onClick={() =>
                    handleIncrease(product.itemID, product.initialQuantity)
                  }
                  className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full text-xl flex justify-center items-center"
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
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-lg"
      >
        Request
      </button>

      {/* Modal Section */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="bg-white p-6 w-80 mx-auto mt-20 rounded-lg shadow-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Submit Borrow Request
        </h2>
        <form className="space-y-6">
          <div>
            <label
              htmlFor="purpose"
              className="block text-sm font-medium text-gray-600"
            >
              Purpose
            </label>
            <input
              type="text"
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 text-gray-700"
            />
          </div>
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-600"
            >
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 text-gray-700"
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
              className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RequestSummary;
