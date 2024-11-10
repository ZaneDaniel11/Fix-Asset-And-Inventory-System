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
    <div className="w-full md:w-1/3 bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Request Summary
      </h2>
      <div className="space-y-3">
        {selectedProducts.map((product) => (
          <div
            key={product.itemID}
            className="flex justify-between items-center text-gray-700"
          >
            <span className="font-medium">{product.itemName}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDecrease(product.itemID)}
                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                -
              </button>
              <span className="text-sm">{product.requestedQuantity}</span>
              <button
                onClick={() =>
                  handleIncrease(product.itemID, product.initialQuantity)
                }
                className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
              >
                +
              </button>
              <button
                onClick={() => handleRemove(product.itemID)}
                className="px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded"
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={openModal}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
      >
        Request
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="bg-white p-6 w-80 mx-auto mt-20 rounded-lg shadow-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Submit Borrow Request
        </h2>
        <form className="space-y-4">
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
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
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
