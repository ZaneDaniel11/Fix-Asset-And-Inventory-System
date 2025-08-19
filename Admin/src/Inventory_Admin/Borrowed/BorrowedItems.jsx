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
        `https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/ViewRequest/${borrowId}`
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
        "https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/UpdateRecieveStatus",
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
        `https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/UpdateReturnStatus/${currentItem.BorrowId}`,
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
      item.ReturnStatus === "Not Returned" // Only include "Not Returned" items
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
            <div className="border-2 border-black rounded">
              <input
                type="text"
                placeholder="Search by  Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 border rounded border-black"
              />
            </div>
          </div>
          <table className="min-w-full border-collapse border border-gray-200 bg-white">
            <thead className="bg-gray-200 ">
              <tr className="font-semibold text-md text-white">
                <th className="border border-gray-300 px-5 py-3">Requested</th>
                <th className="border border-gray-300 px-5 py-3">Date</th>
                <th className="border border-gray-300 px-5 py-3">Purpose</th>
                <th className="border border-gray-300 px-5 py-3">Status</th>
                <th className="border border-gray-300 px-5 py-3">Inventory</th>
                <th className="border border-gray-300 px-5 py-3">Head Admin</th>
                <th className="border border-gray-300 px-5 py-3">School</th>
                <th className="border border-gray-300 px-5 py-3">
                  Return Status
                </th>
                <th className="border border-gray-300 px-5 py-3">Status</th>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-3/4 max-w-5xl p-8 overflow-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-box-archive text-blue-600"></i> Borrow
                Item Details
              </h3>
              <button
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <i className="fa-solid fa-times text-2xl"></i>
              </button>
            </div>

            {/* Borrow Details */}
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-id-card text-blue-500"></i>
                  <span>
                    <strong>ID:</strong> {currentItem.BorrowId}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-user text-blue-500"></i>
                  <span>
                    <strong>Requested By:</strong> {currentItem.RequestedBy}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-calendar-day text-blue-500"></i>
                  <span>
                    <strong>Request Date:</strong> {currentItem.ReqBorrowDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-bullseye text-blue-500"></i>
                  <span>
                    <strong>Purpose:</strong> {currentItem.Purpose}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-info-circle text-blue-500"></i>
                  <span>
                    <strong>Status:</strong> {currentItem.Status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-user-check text-green-500"></i>
                <span>
                  <strong>Inventory Admin:</strong>{" "}
                  <span
                    className={
                      currentItem.Admin1Approval === "Approved"
                        ? "text-green-500"
                        : currentItem.Admin1Approval === "Pending"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }
                  >
                    {currentItem.Admin1Approval}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-user-check text-green-500"></i>
                <span>
                  <strong>Head Admin:</strong>{" "}
                  <span
                    className={
                      currentItem.Admin2Approval === "Approved"
                        ? "text-green-500"
                        : currentItem.Admin2Approval === "Pending"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }
                  >
                    {currentItem.Admin2Approval}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-user-check text-green-500"></i>
                <span>
                  <strong>School Admin:</strong>{" "}
                  <span
                    className={
                      currentItem.Admin3Approval === "Approved"
                        ? "text-green-500"
                        : currentItem.Admin3Approval === "Pending"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }
                  >
                    {currentItem.Admin3Approval}
                  </span>
                </span>
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            {/* Borrowed Items Section */}
            <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <i className="fa-solid fa-boxes-stacked text-green-600"></i>{" "}
              Borrowed Items
            </h4>
            <div className="overflow-y-auto max-h-[300px] space-y-4">
              <ul>
                {borrowLoading ? (
                  <div className="text-center text-gray-500 text-lg">
                    Loading borrowed items...
                  </div>
                ) : borrowedItems.length === 0 ? (
                  <div className="text-center text-gray-500 text-lg">
                    No borrowed items found
                  </div>
                ) : (
                  borrowedItems.map((item) => (
                    <div
                      key={item.ItemId}
                      className="flex items-center gap-6 border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-lg transition-shadow duration-300 mb-3"
                    >
                      {/* Image Section */}
                      <img
                        src="https://via.placeholder.com/100"
                        alt={item.ItemName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      {/* Content Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.ItemName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Quantity: <strong>{item.Quantity}</strong>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </ul>
            </div>

            {/* Modal Footer */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={closeViewModal}
                className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-200 flex items-center gap-2"
              >
                <i className="fa-solid fa-circle-xmark"></i> Close
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
