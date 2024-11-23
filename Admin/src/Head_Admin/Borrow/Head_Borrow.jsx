import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Borrow() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [declineReasonModalOpen, setDeclineReasonModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [adminApproval, setAdminApproval] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const storedUsername = localStorage.getItem("userType");
  useEffect(() => {
    const fetchApprovedBorrowRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:5075/api/BorrowRequestApi/ApprovedByAdmin1"
        );
        const data = await response.json();
        setItems(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedBorrowRequests();
  }, []);

  const handleUpdateApproval = async () => {
    if (adminApproval === "Declined" && !declineReason) {
      // Show the decline reason modal if Declined is selected but no reason is provided
      setDeclineReasonModalOpen(true);
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch(
        `http://localhost:5075/api/BorrowRequestApi/UpdateApprovalAdmin2/${currentItem.BorrowId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admin2Approval: adminApproval,
            rejectReason: adminApproval === "Declined" ? declineReason : "",
            rejectBy: adminApproval === "Declined" ? storedUsername : "",
          }),
        }
      );

      if (response.ok) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.BorrowId === currentItem.BorrowId
              ? { ...item, Admin2Approval: adminApproval }
              : item
          )
        );
        closeUpdateModal();
        toast.success(`Request Updated successfully!`);
      } else {
        console.error("Failed to update approval");
      }
    } catch (error) {
      console.error("Error updating approval", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchBorrowItems = async (borrowId) => {
    setBorrowLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5075/api/BorrowRequestApi/ViewRequest/${borrowId}`
      );
      if (!response.ok) throw new Error("Failed to fetch borrowed items");
      const data = await response.json();
      setBorrowedItems(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setBorrowLoading(false);
    }
  };

  const openViewModal = (item) => {
    setCurrentItem(item);
    setViewModalOpen(true);
    fetchBorrowItems(item.BorrowId);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setCurrentItem(null);
    setBorrowedItems([]);
  };

  const openUpdateModal = (item) => {
    setCurrentItem(item);
    setUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setCurrentItem(null);
    setAdminApproval("");
    setDeclineReason("");
    setDeclineReasonModalOpen(false);
  };

  const handleAdminApprovalChange = (value) => {
    setAdminApproval(value);
    if (value === "Declined") {
      setDeclineReasonModalOpen(true);
    } else {
      setDeclineReasonModalOpen(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.Admin2Approval === "Pending" &&
      item.RequestedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading approved borrow requests...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">Error: {error}</div>;
  }

  return (
    <>
      <div className="limiter w-full">
        <div className="container mx-auto p-6">
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-700">
              Borrow Overview
            </h2>
          </div>

          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search by Requester Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border border-gray-300 rounded w-full max-w-sm"
            />
          </div>

          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full border-collapse border border-gray-200 bg-white">
              <thead className="bg-gray-200">
                <tr className="font-semibold text-md text-zinc-50">
                  <th className="border border-gray-300 px-5 py-3">
                    Borrow ID
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Requested By
                  </th>
                  <th className="border border-gray-300 px-5 py-3">Date</th>
                  <th className="border border-gray-300 px-5 py-3">Purpose</th>
                  <th className="border border-gray-300 px-5 py-3">Priority</th>
                  <th className="border border-gray-300 px-5 py-3">Status</th>
                  <th className="border border-gray-300 px-5 py-3">
                    Admin1 Approval
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Admin2 Approval
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
                      {item.BorrowId}
                    </td>
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
                        item.Priority === "High"
                          ? "text-red-600 font-bold"
                          : item.Priority === "Medium"
                          ? "text-yellow-600 font-medium"
                          : "text-green-600 font-light"
                      }`}
                    >
                      {item.Priority}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 ${
                        item.Status === "Pending"
                          ? "text-yellow-600"
                          : item.Status === "Approved"
                          ? "text-green-500"
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
                          ? "text-green-500"
                          : item.Admin1Approval === "Rejected"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {item.Admin1Approval}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 ${
                        item.Admin2Approval === "Approved"
                          ? "text-green-500"
                          : item.Admin2Approval === "Rejected"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {item.Admin2Approval}
                    </td>
                    <td className="border border-gray-300 px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openViewModal(item)}
                          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openUpdateModal(item)}
                          className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Decline Reason Modal */}
      {/* Decline Reason Modal */}
      {declineReasonModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setDeclineReasonModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
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
            {/* Header */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Reason for Declining
            </h2>
            {/* Text Area */}
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none mb-4"
              placeholder="Please provide the reason for declining..."
              rows={5}
            />
            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeclineReasonModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateApproval}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            {/* Header */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Update Approval
            </h2>
            {/* Select Approval */}
            <select
              value={adminApproval}
              onChange={(e) => handleAdminApprovalChange(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
            >
              <option value="">Select Approval</option>
              <option value="Approved">Approved</option>
              <option value="Declined">Declined</option>
            </select>
            {/* Decline Reason (Conditional) */}
            {adminApproval === "Declined" && (
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none mb-4"
                placeholder="Provide a reason for declining..."
                rows={5}
              />
            )}
            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeUpdateModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateApproval}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            {/* Header */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Borrowed Items
            </h2>
            {/* Borrowed Items List */}
            <div className="space-y-4">
              {borrowedItems.map((borrowItem) => (
                <div
                  key={borrowItem.ItemId}
                  className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-4 shadow-sm hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Image */}
                  <img
                    src="https://via.placeholder.com/100"
                    alt={borrowItem.ItemName}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  {/* Item Info */}
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {borrowItem.ItemName}
                    </h3>
                    <p className="text-gray-600">
                      Quantity: {borrowItem.Quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Close Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={closeViewModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
