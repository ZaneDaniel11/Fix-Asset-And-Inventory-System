// File: RequestItems.js
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function RequestItems() {
  // All state variables
  const [viewModal, setViewModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [admin2Approvals, setAdmin2Approval] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [items, setItems] = useState([]);

  // Fetching API data
  useEffect(() => {
    fetch("https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/RequestItemsApi/GetAllRequests")
      .then((response) => response.json())
      .then((data) => {
        const mappedItems = data.map((item) => ({
          id: item.requestID,
          name: item.requestedItem,
          requestedBy: item.requestedBy,
          requestedDate: new Date(item.requestedDate).toLocaleString(),
          status: item.status,
          priority: item.priority,
          Admin1: item.admin1Approval,
          Admin2: item.admin2Approval,
          Description: item.Description,
          Cost: item.estimatedCost,
          Purpose: item.Purpose,
          SuggestedDealer: item.suggestedDealer,
          Admin3: item.admin3Approval,
        }));
        setItems(mappedItems);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Functions for modals
  const openViewModal = (item) =>
    setCurrentItem(item) || setViewModalOpen(true);
  const openEditModal = (item) => {
    console.log("Opening modal for item:", item);
    setCurrentItem(item);
    setAdmin2Approval(item.Admin2);
    setUpdateModalOpen(true);
  };

  const closeEditModal = () => setUpdateModalOpen(false);
  const closeViewModal = () => setViewModalOpen(false);
  const closeDeclineModal = () => {
    setDeclineModalOpen(false);
    setDeclineReason("");
  };
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      item.Admin1 === "Approved" &&
      item.Admin2 === "Pending"
  );

  const handleSaveChanges = async () => {
    if (admin2Approvals === "Declined" && !declineReason) {
      setDeclineModalOpen(true);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(
        `https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/RequestItemsApi/UpdateAdmin2Approval/${currentItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admin2Approval: admin2Approvals,
            rejectReason: admin2Approvals === "Declined" ? declineReason : "",
            rejectBy: admin2Approvals === "Declined" ? "StoredUsername" : "",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update approval status");
      }

      const updatedItems = items.map((item) =>
        item.id === currentItem.id ? { ...item, Admin2: admin2Approvals } : item
      );
      setItems(updatedItems);
      toast.success("Request updated successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
      closeEditModal();
      closeDeclineModal();
    }
  };
  return (
    <>
      <div className="limiter w-full">
        <div className="container mx-auto p-6">
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-700">
              Request Item Overview
            </h2>
          </div>

          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search by Item Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded border-black"
            />
          </div>

          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full border-collapse border border-gray-200 bg-white">
              <thead className="bg-gray-200">
                <tr className="font-semibold text-md text-white ">
                  <th className="border border-gray-300 px-6 py-3">
                    Request ID
                  </th>
                  <th className="border border-gray-300 px-6 py-3">
                    Item Name
                  </th>
                  <th className="border border-gray-300 px-6 py-3">
                    Requested By
                  </th>
                  <th className="border border-gray-300 px-6 py-3">
                    Requested Date
                  </th>
                  <th className="border border-gray-300 px-6 py-3">Status</th>
                  <th className="border border-gray-300 px-6 py-3">Priority</th>
                  <th className="border border-gray-300 px-6 py-3">
                    Inventory Admin
                  </th>
                  <th className="border border-gray-300 px-6 py-3">Approval</th>
                  <th className="border border-gray-300 px-6 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition duration-200`}
                  >
                    <td className="border border-gray-300 px-6 py-4">
                      {item.id}
                    </td>
                    <td className="border border-gray-300 px-6 py-4">
                      {item.name}
                    </td>
                    <td className="border border-gray-300 px-6 py-4">
                      {item.requestedBy}
                    </td>
                    <td className="border border-gray-300 px-6 py-4">
                      {new Date(item.requestedDate).toLocaleDateString()}
                    </td>

                    {/* Status with Conditional Styling */}
                    <td
                      className={`border border-gray-300 px-6 py-4 font-medium ${
                        item.status === "Pending"
                          ? "text-yellow-500"
                          : item.status === "Approved"
                          ? "text-green-500"
                          : item.status === "Rejected"
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {item.status}
                    </td>

                    <td className="border border-gray-300 px-6 py-4">
                      {item.priority}
                    </td>

                    {/* Admin1 with Conditional Styling */}
                    <td
                      className={`border border-gray-300 px-6 py-4 font-medium ${
                        item.Admin1 === "Pending"
                          ? "text-yellow-500"
                          : item.Admin1 === "Approved"
                          ? "text-green-500"
                          : item.Admin1 === "Rejected"
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {item.Admin1}
                    </td>

                    {/* Admin2 with Conditional Styling */}
                    <td
                      className={`border border-gray-300 px-6 py-4 font-medium ${
                        item.Admin2 === "Pending"
                          ? "text-yellow-500"
                          : item.Admin2 === "Approved"
                          ? "text-green-500"
                          : item.Admin2 === "Rejected"
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {item.Admin2}
                    </td>

                    {/* Action Buttons */}
                    <td className="border border-gray-300 px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openViewModal(item)}
                          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 transition duration-150"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {updateModalOpen && currentItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
              <button
                onClick={closeEditModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition duration-200"
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
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Update Admin Approval
              </h2>
              <select
                value={admin2Approvals}
                onChange={(e) => setAdmin2Approval(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Declined">Declined</option>
              </select>
              <button
                onClick={handleSaveChanges}
                className={`w-full py-3 rounded-lg text-white font-semibold transition duration-200 ${
                  isUpdating
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Approval"}
              </button>
            </div>
          </div>
        )}
        {declineModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
              <button
                onClick={closeDeclineModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition duration-200"
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
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Decline Reason
              </h2>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-6"
                placeholder="Enter reason for decline"
                rows="4"
              ></textarea>
              <button
                onClick={handleSaveChanges}
                // Call handleUpdate directly
                className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold transition duration-200"
              >
                Submit Decline Reason
              </button>
            </div>
          </div>
        )}
        {/* View Item Details Modal */}
        {viewModal && currentItem && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-3/4 max-w-5xl p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <i className="fa-solid fa-file-alt text-blue-600"></i>{" "}
                  Requested Item Details
                </h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-500 hover:text-gray-700 transition duration-200"
                >
                  <i className="fa-solid fa-times text-2xl"></i>
                </button>
              </div>

              {/* Requested Item Details */}
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="fa-solid fa-id-card text-blue-500"></i>
                    <span>
                      <strong>ID:</strong> {currentItem.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="fa-solid fa-user text-blue-500"></i>
                    <span>
                      <strong>Requested By:</strong> {currentItem.requestedBy}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="fa-solid fa-calendar-day text-blue-500"></i>
                    <span>
                      <strong>Requested Date:</strong>{" "}
                      {currentItem.requestedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="fa-solid fa-store text-blue-500"></i>
                    <span>
                      <strong>Suggested Dealer:</strong>{" "}
                      {currentItem.SuggestedDealer}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="fa-solid fa-bullseye text-blue-500"></i>
                    <span>
                      <strong>Purpose:</strong> {currentItem.Purpose}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="fa-solid fa-dollar-sign text-green-500"></i>
                    <span>
                      <strong>Estimated Cost:</strong> {currentItem.Cost}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <i
                      className={`fa ${[currentItem.status]} text-blue-500`}
                    ></i>
                    <span>
                      <strong>Status:</strong> {currentItem.status}
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
                        currentItem.Admin1 === "Approved"
                          ? "text-green-500"
                          : currentItem.Admin1 === "Pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }
                    >
                      {currentItem.Admin1}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-user-check text-green-500"></i>
                  <span>
                    <strong>Head Admin:</strong>{" "}
                    <span
                      className={
                        currentItem.Admin2 === "Approved"
                          ? "text-green-500"
                          : currentItem.Admin2 === "Pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }
                    >
                      {currentItem.Admin2}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-user-check text-green-500"></i>
                  <span>
                    <strong>School Admin:</strong>{" "}
                    <span
                      className={
                        currentItem.Admin3 === "Approved"
                          ? "text-green-500"
                          : currentItem.Admin3 === "Pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }
                    >
                      {currentItem.Admin3}
                    </span>
                  </span>
                </div>
              </div>

              <hr className="my-6 border-gray-300" />

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
      </div>
    </>
  );
}
