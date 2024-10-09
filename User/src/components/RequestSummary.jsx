import React, { useState } from "react";
import Modal from "react-modal";

const RequestSummary = ({
  selectedProducts,
  onQuantityChange,
  onRemoveProduct,
  onRequestCompleted, // New prop for resetting products
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [priority, setPriority] = useState("");

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSave = async () => {
    const loggedInUsername = localStorage.getItem("username");
    const borrowerId = localStorage.getItem("userId");

    if (!borrowerId) {
      alert("User is not logged in. Please log in again.");
      return;
    }

    const requestPayload = {
      requestedBy: loggedInUsername || "Unknown",
      borrowerId: parseInt(borrowerId), // Always convert to a number
      purpose: purpose,
      status: "Pending",
      priority: priority,
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Borrow request submitted successfully!", data);

        // Clear the selected products after successful request
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

  const handleRemove = (itemID) => {
    onRemoveProduct(itemID); // Call the remove function from props
  };

  return (
    <div className="w-1/3 bg-gray-50 p-4 rounded-lg shadow-lg block">
      <h2 className="text-xl font-bold mb-4">Request Summary</h2>
      <div className="space-y-4">
        {selectedProducts.map((product) => (
          <div
            key={product.itemID}
            className="flex justify-between items-center"
          >
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
              {/* X button to remove the product */}
              <button
                onClick={() => handleRemove(product.itemID)}
                className="bg-gray-500 text-white px-2 rounded ml-2"
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Request Button */}
      <button
        onClick={openModal}
        className="w-full mt-4 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded"
      >
        Request
      </button>

      {/* Modal for Purpose and Priority */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Borrow Request"
      >
        <h2 className="text-xl font-bold mb-4">Submit Borrow Request</h2>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="purpose">
              Purpose
            </label>
            <input
              type="text"
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            >
              <option value="">Select Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className=" bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded mt-4"
          >
            Save
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-4 ml-2"
          >
            Cancel
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default RequestSummary;
