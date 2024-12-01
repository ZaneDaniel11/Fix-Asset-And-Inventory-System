import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function BorrowedItems() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [returnStatusQuery, setReturnStatusQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [adminApproval, setAdminApproval] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [returnStatus, setReturnStatus] = useState(""); // New state for return status
  const [status, setStatus] = useState(""); // New state for main status

  const [borrowedItems, setBorrowedItems] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [receiveStatus, setReceiveStatus] = useState("");
  const [isReceiveStatusModalOpen, setIsReceiveStatusModalOpen] =
    useState(false);

  const fetchBorrowRequests = async () => {
    try {
      const response = await fetch(
        "http://localhost:5075/api/BorrowRequestApi/AllRequests"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch borrow requests");
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBorrowRequests();
  }, []);

  const fetchBorrowItems = async (borrowId) => {
    setBorrowLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5075/api/BorrowRequestApi/ViewRequest/${borrowId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch borrowed items");
      }
      const data = await response.json();
      setBorrowedItems(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setBorrowLoading(false);
    }
  };
  const openReceiveStatusModal = (item) => {
    setCurrentItem(item);
    setReceiveStatus(item?.RecieveStatus || ""); // Default to the current status
    setIsReceiveStatusModalOpen(true);
  };

  // Function to close the modal
  const closeReceiveStatusModal = () => {
    setIsReceiveStatusModalOpen(false);
    setCurrentItem(null);
    setReceiveStatus("");
  };

  const openViewModal = (item) => {
    setCurrentItem(item);
    setViewModalOpen(true);
    fetchBorrowItems(item.BorrowId);
  };

  const openUpdateModal = (item) => {
    setCurrentItem(item);
    setAdminApproval(item.Admin1Approval);
    setStatus(item.Status);
    setReturnStatus(item.ReturnStatus);
    setUpdateModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setCurrentItem(null);
    setBorrowedItems([]);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setCurrentItem(null);
  };

  const handleReceiveStatusUpdate = async () => {
    if (!currentItem || !receiveStatus) {
      alert("Please select a valid status.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5075/api/BorrowRequestApi/UpdateRecieveStatus",
        {
          method: "POST", // Assuming POST, change if required
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            borrowID: currentItem.BorrowId,
            recieveStatus: receiveStatus,
          }),
        }
      );

      // Handle non-JSON responses gracefully
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(responseText || "Failed to update receive status.");
      }

      toast.success(
        `Receive status successfully updated for Borrow ID: ${currentItem.BorrowId}`
      );
      fetchBorrowRequests();

      // Notify the user of success
      closeReceiveStatusModal();
    } catch (error) {
      console.error("Error updating receive status:", error);
      alert(
        `An error occurred while updating the receive status: ${error.message}`
      );
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updatedItem = {
        returnStatus: returnStatus,
      };

      const response = await fetch(
        `http://localhost:5075/api/BorrowRequestApi/UpdateReturnStatus/${currentItem.BorrowId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem),
        }
      );

      if (!response.ok) {
        console.log("Response status:", response.status);
        console.log("Response text:", await response.text());
        throw new Error("Failed to update borrow request");
      }

      // Display success notification
      toast.success(
        `Borrow request ${currentItem.BorrowId} updated successfully!`
      );
      fetchBorrowRequests();

      closeUpdateModal();
    } catch (error) {
      // Display error notification
      toast.error(`Error updating borrow request: ${error.message}`);
      setError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter items based on search query, status, and return status
  const filteredItems = items.filter(
    (item) =>
      item.RequestedBy.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (returnStatusQuery === "" || item.ReturnStatus === returnStatusQuery) &&
      item.Admin3Approval === "Approved" &&
      item.ReturnStatus === "Returned" // Only include "Not Returned" items
  );

  if (loading) {
    return <div>Loading borrow requests...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="limiter w-full bg-gray-100 min-h-screen p-6">
        <div className="container mx-auto p-6">
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-4xl font-bold text-gray-700">
              Borrowed Item List
            </h2>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex flex-wrap gap-4 justify-between items-center">
            <input
              type="text"
              placeholder="Search by Requester Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded border-black"
            />
          </div>
          <table className="min-w-full border-collapse border border-gray-200 bg-white">
            <thead className="bg-gray-200 ">
              <tr className="font-semibold text-md text-white">
                <th className="border border-gray-300 px-5 py-3">Requested</th>
                <th className="border border-gray-300 px-5 py-3">Date</th>
                <th className="border border-gray-300 px-5 py-3">Purpose</th>
                <th className="border border-gray-300 px-5 py-3">Status</th>
                <th className="border border-gray-300 px-5 py-3">
                  Inventory Admin
                </th>
                <th className="border border-gray-300 px-5 py-3">Head Admin</th>
                <th className="border border-gray-300 px-5 py-3">
                  School Admin
                </th>
                <th className="border border-gray-300 px-5 py-3">
                  Return Status
                </th>
                <th className="border border-gray-300 px-5 py-3">
                  Claimed Status
                </th>
                <th className="border border-gray-300 px-5 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.BorrowId} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-5 py-3">
                    {item.RequestedBy}
                  </td>
                  <td className="border border-gray-300 px-5 py-3">
                    {item.ReqBorrowDate}
                  </td>
                  <td className="border border-gray-300 px-5 py-3">
                    {item.Purpose}
                  </td>
                  <td
                    className={`border border-gray-300 px-5 py-3 ${
                      item.Status === "Pending"
                        ? "text-yellow-600"
                        : item.Status === "Approved"
                        ? "text-green-600"
                        : item.Status === "Rejected"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {item.Status}
                  </td>
                  <td
                    className={`border border-gray-300 px-5 py-3 ${
                      item.Admin1Approval === "Approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.Admin1Approval}
                  </td>
                  <td
                    className={`border border-gray-300 px-5 py-3 ${
                      item.Admin2Approval === "Approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.Admin2Approval}
                  </td>
                  <td
                    className={`border border-gray-300 px-5 py-3 ${
                      item.Admin3Approval === "Approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.Admin3Approval}
                  </td>
                  <td
                    className={`border border-gray-300 px-5 py-3 ${
                      item.ReturnStatus === "Returned"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.ReturnStatus}
                  </td>
                  {/* Receive Status Column */}
                  <td
                    className={`border border-gray-300 px-5 py-3 ${
                      item.RecieveStatus === "Received"
                        ? "text-green-600"
                        : item.RecieveStatus === "Not Recieve"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {item.RecieveStatus}
                  </td>
                  {/* Actions Column */}
                  <td className="border border-gray-300 px-5 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => openViewModal(item)}
                      className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 shadow-md"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => openUpdateModal(item)}
                      className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5 shadow-md ml-2"
                    >
                      <i className="fa-solid fa-edit"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => openReceiveStatusModal(item)}
                      className="text-white bg-purple-700 hover:bg-purple-800 font-medium rounded-lg text-sm px-3 py-1.5 shadow-md ml-2"
                    >
                      <i className="fa-solid fa-clipboard-check"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isReceiveStatusModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              Update Receive Status
            </h2>
            <p className="text-gray-700 mb-4">
              Borrow ID: <strong>{currentItem?.BorrowId}</strong>
            </p>
            <select
              value={receiveStatus}
              onChange={(e) => setReceiveStatus(e.target.value)}
              className="p-2 border rounded border-gray-300 w-full mb-4"
            >
              <option value="">Select Status</option>
              <option value="Received">Received</option>
              <option value="Not Received">Not Received</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeReceiveStatusModal}
                className="text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium rounded-lg text-sm px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReceiveStatusUpdate}
                className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
            {/* Close Button */}
            <button
              onClick={closeViewModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 text-lg focus:outline-none"
            >
              ✕
            </button>

            {/* Modal Title */}
            <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">
              Borrowed Items for Request:
              <span className="block text-blue-600 mt-1">
                {currentItem.BorrowId}
              </span>
            </h2>

            {/* Loading or Empty State */}
            {borrowLoading ? (
              <div className="text-center text-gray-500 text-sm">
                Loading borrowed items...
              </div>
            ) : borrowedItems.length === 0 ? (
              <div className="text-center text-gray-500 text-sm">
                No borrowed items found
              </div>
            ) : (
              // Borrowed Items List
              <div className="space-y-4">
                {borrowedItems.map((borrowItem, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-50 border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow duration-300"
                  >
                    {/* Placeholder for Image Section */}
                    <div className="flex-shrink-0">
                      <img
                        src="https://via.placeholder.com/80"
                        alt={borrowItem.ItemName}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </div>

                    {/* Content Section */}
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {borrowItem.ItemName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantity:{" "}
                        <span className="font-medium text-gray-800">
                          {borrowItem.Quantity}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={closeViewModal}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded-md focus:outline-none transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {updateModalOpen && currentItem && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-8 relative">
            {/* Close Button */}
            <button
              onClick={closeUpdateModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Header */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Update Borrow Request
            </h2>

            {/* Form */}
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Label */}
              <label className="block mb-3 text-sm font-medium text-gray-600">
                Return Status
              </label>

              {/* Select Dropdown */}
              <select
                value={returnStatus}
                onChange={(e) => setReturnStatus(e.target.value)}
                className="w-full mb-5 p-3 border rounded-lg text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="Pending">Pending</option>
                <option value="Returned">Returned</option>
                <option value="Not Returned">Not Returned</option>
              </select>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition ${
                    isUpdating
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
