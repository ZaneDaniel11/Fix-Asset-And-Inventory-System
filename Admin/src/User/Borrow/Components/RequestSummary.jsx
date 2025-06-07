"use client"

import { useState } from "react"
import { toast } from "react-toastify"

const RequestSummary = ({ selectedProducts, onQuantityChange, onRemoveProduct, onRequestCompleted }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [purpose, setPurpose] = useState("")
  const [priority, setPriority] = useState("")
  const [imageErrors, setImageErrors] = useState({})

  const openModal = () => setModalIsOpen(true)
  const closeModal = () => setModalIsOpen(false)

  const handleSave = async () => {
    const loggedInUsername = localStorage.getItem("name")
    const borrowerId = localStorage.getItem("userId")
    const email = localStorage.getItem("email")

    if (!borrowerId) {
      alert("User is not logged in. Please log in again.")
      return
    }

    const requestPayload = {
      requestedBy: loggedInUsername || "Unknown",
      borrowerId: Number.parseInt(borrowerId),
      purpose,
      status: "Pending",
      priority,
      email: email,
      items: selectedProducts.map((product) => ({
        itemName: product.itemName,
        quantity: product.requestedQuantity,
        itemID: product.itemID,
        categoryID: product.categoryID,
      })),
    }

    try {
      const response = await fetch(
        "https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/Request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        },
      )

      if (response.ok) {
        onRequestCompleted()
        toast.success("Borrow request submitted successfully!")
        setPurpose("")
        setPriority("")
        closeModal()
      } else {
        console.error("Error submitting request:", response.statusText)
      }
    } catch (error) {
      console.error("Error submitting request:", error)
    }
  }

  const handleIncrease = (itemID, availableQuantity) => {
    const product = selectedProducts.find((p) => p.itemID === itemID)
    if (product.requestedQuantity < availableQuantity) {
      onQuantityChange(itemID, product.requestedQuantity + 1)
    }
  }

  const handleDecrease = (itemID) => {
    const product = selectedProducts.find((p) => p.itemID === itemID)
    if (product.requestedQuantity > 1) {
      onQuantityChange(itemID, product.requestedQuantity - 1)
    }
  }

  const handleRemove = (itemID) => onRemoveProduct(itemID)

  const handleImageError = (itemID) => {
    setImageErrors((prev) => ({
      ...prev,
      [itemID]: true,
    }))
  }

  // Determine if scrolling should be enabled (when items >= 5)
  const shouldScroll = selectedProducts.length >= 5

  return (
    <div className="w-full sm:w-[280px] md:w-[300px] lg:w-[320px] bg-white p-4 rounded-lg shadow-lg block">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">Borrow Summary</h2>
      <div
        className={`space-y-3 ${
          shouldScroll
            ? "max-h-[450px] overflow-y-auto pr-2 mb-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
            : ""
        }`}
      >
        {selectedProducts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-3 text-gray-400"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p className="text-sm">No items added yet</p>
          </div>
        ) : (
          selectedProducts.map((product) => (
            <div
              key={product.itemID}
              className="flex items-center border p-3 rounded-lg shadow-md bg-gray-100 space-x-3"
            >
              <div className="flex-shrink-0">
                {!product.imageUrl || imageErrors[product.itemID] ? (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4B5563"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                  </div>
                ) : (
                  <img
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.itemName}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={() => handleImageError(product.itemID)}
                  />
                )}
              </div>
              <div className="flex-1 relative">
                <button
                  onClick={() => handleRemove(product.itemID)}
                  className="absolute top-0 right-0 text-red-500 hover:text-red-600 text-base transition"
                >
                  ✕
                </button>
                <h3 className="text-base font-semibold text-gray-800 mb-1 pr-5">{product.itemName}</h3>
                <p className="text-xs text-gray-600 mb-2">
                  Quantity: <span className="font-medium">{product.requestedQuantity}</span>
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDecrease(product.itemID)}
                    className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm flex justify-center items-center transition"
                  >
                    -
                  </button>
                  <span className="text-base font-semibold text-gray-800">{product.requestedQuantity}</span>
                  <button
                    onClick={() => handleIncrease(product.itemID, product.initialQuantity)}
                    className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm flex justify-center items-center transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {selectedProducts.length > 0 && (
        <div className="mt-3 bg-gray-100 p-2 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm text-gray-700">Total Items:</span>
            <span className="font-bold text-gray-800">
              {selectedProducts.reduce((total, product) => total + product.requestedQuantity, 0)}
            </span>
          </div>
        </div>
      )}
      <button
        onClick={openModal}
        disabled={selectedProducts.length === 0}
        className={`w-full mt-4 py-2 rounded-lg font-medium text-base shadow-md transition ${
          selectedProducts.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        Request
      </button>

      {/* Modal Section */}
      {modalIsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 w-full max-w-md rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center border-b pb-3">
              Submit Borrow Request
            </h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!purpose.trim()) {
                  alert("Purpose is required")
                  return
                }
                handleSave()
              }}
            >
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none text-gray-800"
                  placeholder="Enter the purpose"
                />
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none text-gray-800"
                >
                  <option value="">Select Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestSummary
