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
          "https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/ApprovedByAdmin1"
        );
        const data = await response.json();
        console.log(data);
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
        `https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/UpdateApprovalAdmin2/${currentItem.BorrowId}`,
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
        `https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/ViewRequest/${borrowId}`
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
                    Inventory Admin
                  </th>
                  <th className="border border-gray-300 px-5 py-3">Approval</th>
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
                      className={`border border-gray-300 px-4 py-2 font-medium ${
                        item.Status === "Pending"
                          ? "text-yellow-600"
                          : item.Status === "Rejected"
                          ? "text-red-600"
                          : item.Status === "Approved"
                          ? "text-green-500"
                          : "text-blue-600"
                      }`}
                    >
                      <i
                        className={`fa ${
                          item.Status === "Approved"
                            ? "fa-check-circle"
                            : item.Status === "Rejected"
                            ? "fa-times-circle"
                            : item.Status === "Pending"
                            ? "fa-hourglass-half"
                            : "fa-circle"
                        } mr-1`}
                      ></i>
                      {item.Status}
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-2 font-medium ${
                        item.Admin1Approval === "Pending"
                          ? "text-yellow-600"
                          : item.Admin1Approval === "Rejected"
                          ? "text-red-600"
                          : item.Admin1Approval === "Approved"
                          ? "text-green-500"
                          : "text-blue-600"
                      }`}
                    >
                      <i
                        className={`fa ${
                          item.Admin1Approval === "Approved"
                            ? "fa-check-circle"
                            : item.Admin1Approval === "Rejected"
                            ? "fa-times-circle"
                            : item.Admin1Approval === "Pending"
                            ? "fa-hourglass-half"
                            : "fa-circle"
                        } mr-1`}
                      ></i>
                      {item.Admin1Approval}
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-2 font-medium ${
                        item.Admin2Approval === "Pending"
                          ? "text-yellow-600"
                          : item.Admin2Approval === "Rejected"
                          ? "text-red-600"
                          : item.Admin2Approval === "Approved"
                          ? "text-green-500"
                          : "text-blue-600"
                      }`}
                    >
                      <i
                        className={`fa ${
                          item.Admin2Approval === "Approved"
                            ? "fa-check-circle"
                            : item.Admin2Approval === "Rejected"
                            ? "fa-times-circle"
                            : item.Admin2Approval === "Pending"
                            ? "fa-hourglass-half"
                            : "fa-circle"
                        } mr-1`}
                      ></i>
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
                {borrowedItems.map((item) => (
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
                ))}
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
    </>
  );
}
