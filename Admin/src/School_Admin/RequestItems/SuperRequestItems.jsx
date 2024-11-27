import React, { useState, useEffect } from "react";

export default function RequestItems() {
  const [editModal, setEditModalOpen] = useState(false);
  const [viewModal, setViewModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [items, setItems] = useState([]);
  const [adminApproval, setAdminApproval] = useState("");
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const storedUsername = localStorage.getItem("userType");
  const closeDeclineModal = () => {
    setDeclineModalOpen(false);
    setDeclineReason("");
  };

  // Fetch API data
  useEffect(() => {
    fetch("http://localhost:5075/api/RequestItemsApi/GetAllRequests")
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
          Admin3: item.admin3Approval,
        }));
        setItems(mappedItems);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const openEditModal = (item) => {
    setCurrentItem(item);
    setAdminApproval(item.Admin2);
    setEditModalOpen(true);
  };
  const closeEditModal = () => setEditModalOpen(false);

  const openViewModal = (item) => {
    setCurrentItem(item);
    setViewModalOpen(true);
  };
  const closeViewModal = () => setViewModalOpen(false);

  // Filter items by search query, status, and Admin1 approval
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusQuery === "" || item.status === statusQuery) &&
      item.Admin2 === "Approved" &&
      item.status === "In Progress"
  );

  const handleUpdate = async () => {
    if (adminApproval === "Declined" && !declineReason) {
      setDeclineModalOpen(true); // Open decline reason modal if no reason is provided
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(
        `http://localhost:5075/api/RequestItemsApi/UpdateAdmin3Approval/${currentItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admin3Approval: adminApproval,
            rejectReason: adminApproval === "Declined" ? declineReason : "",
            rejectBy: adminApproval === "Declined" ? storedUsername : "",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server response:", errorData); // Log server response for debugging
        throw new Error("Failed to update approval status");
      }

      // Update local items list to reflect the status change
      const updatedItems = items.map((item) =>
        item.BorrowId === currentItem.BorrowId
          ? {
              ...item,
              Admin1Approval: adminApproval,
              Status:
                adminApproval === "Approved" ? "In Progress" : item.Status,
              DeclineReason:
                adminApproval === "Declined" ? declineReason : null,
              RejectBy: adminApproval === "Declined" ? storedUsername : null,
            }
          : item
      );
      setItems(updatedItems);

      closeUpdateModal();
      closeDeclineModal();
      setDeclineReason("");
      toast.success(`Request Updated successfully!`); // Reset decline reason after submission
    } catch (error) {
      console.error("Error updating approval:", error.message);
      setError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };
  const closeUpdateModal = () => {
    setEditModalOpen(false);
    setCurrentItem(null);
  };

  return (
    <>
      <div className="limiter w-full">
        <div className="container mx-auto p-6">
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-700">
              Request Overview
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
            <select
              value={statusQuery}
              onChange={(e) => setStatusQuery(e.target.value)}
              className="p-2 border rounded border-black"
            >
              <option value="">All Statuses</option>
              <option value="Complete">Complete</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full border-collapse border border-gray-200 bg-white">
              <thead className="bg-gray-200">
                <tr className="font-semibold text-md text-zinc-50">
                  <th className="border border-gray-300 px-5 py-3">
                    Request ID
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Item Name
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Requested By
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Requested Date
                  </th>
                  <th className="border border-gray-300 px-5 py-3">Status</th>
                  <th className="border border-gray-300 px-5 py-3">Priority</th>
                  <th className="border border-gray-300 px-5 py-3">
                    Inventory Admin
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Head Admin
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    School Admin
                  </th>
                  <th className="border border-gray-300 px-5 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-5 py-3">
                      {item.id}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {item.name}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {item.requestedBy}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {item.requestedDate}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.status === "Pending"
                          ? "text-yellow-600"
                          : item.status === "Rejected"
                          ? "text-red-600"
                          : item.status === "In Progress"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      <i
                        className={`fa mr-1 ${
                          item.status === "Approved"
                            ? "fa-check-circle"
                            : item.status === "Rejected"
                            ? "fa-times-circle"
                            : "fa-hourglass-half"
                        }`}
                      ></i>
                      {item.status}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.priority === "High"
                          ? "text-red-600"
                          : item.priority === "Medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {item.priority}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.Admin1 === "Pending"
                          ? "text-yellow-600"
                          : item.Admin1 === "Rejected"
                          ? "text-red-600"
                          : item.Admin1 === "In Progress"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      <i
                        className={`fa mr-1 ${
                          item.Admin1 === "Approved"
                            ? "fa-check-circle"
                            : item.Admin1 === "Rejected"
                            ? "fa-times-circle"
                            : "fa-hourglass-half"
                        }`}
                      ></i>
                      {item.Admin1}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.Admin2 === "Pending"
                          ? "text-yellow-600"
                          : item.Admin2 === "Rejected"
                          ? "text-red-600"
                          : item.Admin2 === "In Progress"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      <i
                        className={`fa mr-1 ${
                          item.Admin2 === "Approved"
                            ? "fa-check-circle"
                            : item.Admin2 === "Rejected"
                            ? "fa-times-circle"
                            : "fa-hourglass-half"
                        }`}
                      ></i>
                      {item.Admin2}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.Admin3 === "Pending"
                          ? "text-yellow-600"
                          : item.Admin3 === "Rejected"
                          ? "text-red-600"
                          : item.Admin3 === "In Progress"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      <i
                        className={`fa mr-1 ${
                          item.Admin3 === "Approved"
                            ? "fa-check-circle"
                            : item.Admin3 === "Rejected"
                            ? "fa-times-circle"
                            : "fa-hourglass-half"
                        }`}
                      ></i>
                      {item.Admin3}
                    </td>
                    <td className="border border-gray-300 px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openViewModal(item)}
                          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
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
      </div>

      {/* Edit Modal */}

      {viewModal && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg max-w-3xl w-full mx-4 md:mx-0 shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h5 className="text-2xl font-bold text-gray-800">
                <i className="fa-solid fa-eye mr-3 text-blue-500"></i> View Item
                Details
              </h5>
              <button
                type="button"
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark text-3xl"></i>
              </button>
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
              <div>
                <p className="text-lg font-semibold text-gray-600">Item Name</p>
                <p className="text-xl text-gray-800">{currentItem.name}</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600">
                  Requested By
                </p>
                <p className="text-xl text-gray-800">
                  {currentItem.requestedBy}
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600">
                  Requested Date
                </p>
                <p className="text-xl text-gray-800">
                  {currentItem.requestedDate}
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600">Priority</p>
                <p
                  className={`text-xl font-semibold ${
                    currentItem.priority === "High"
                      ? "text-red-600"
                      : currentItem.priority === "Medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {currentItem.priority}
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600">Status</p>
                <p
                  className={`text-xl font-semibold ${
                    currentItem.status === "Complete"
                      ? "text-green-600"
                      : currentItem.status === "In Progress"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  <i
                    className={`mr-2 ${
                      currentItem.status === "Complete"
                        ? "fa-solid fa-check-circle"
                        : currentItem.status === "In Progress"
                        ? "fa-solid fa-spinner fa-spin"
                        : "fa-solid fa-times-circle"
                    }`}
                  ></i>
                  {currentItem.status}
                </p>
              </div>
            </div>

            {/* Approval Status */}
            <div>
              <h6 className="text-lg font-bold text-gray-600 mb-4">
                Approval Status
              </h6>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Admin 1 */}
                <div className="flex flex-col items-center bg-gray-50 p-5 rounded-lg shadow-md">
                  <i
                    className={`text-3xl mb-3 ${
                      currentItem.Admin1 === "Approved"
                        ? "fa-solid fa-check-circle text-green-600"
                        : currentItem.Admin1 === "Rejected"
                        ? "fa-solid fa-times-circle text-red-600"
                        : "fa-solid fa-hourglass-half text-yellow-600"
                    }`}
                  ></i>
                  <p className="text-lg text-gray-700 font-medium">
                    Inventory Admin
                  </p>
                  <span
                    className={`text-xl font-semibold ${
                      currentItem.Admin1 === "Approved"
                        ? "text-green-600"
                        : currentItem.Admin1 === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {currentItem.Admin1}
                  </span>
                </div>
                {/* Admin 2 */}
                <div className="flex flex-col items-center bg-gray-50 p-5 rounded-lg shadow-md">
                  <i
                    className={`text-3xl mb-3 ${
                      currentItem.Admin2 === "Approved"
                        ? "fa-solid fa-check-circle text-green-600"
                        : currentItem.Admin2 === "Rejected"
                        ? "fa-solid fa-times-circle text-red-600"
                        : "fa-solid fa-hourglass-half text-yellow-600"
                    }`}
                  ></i>
                  <p className="text-lg text-gray-700 font-medium">
                    Head Admin
                  </p>
                  <span
                    className={`text-xl font-semibold ${
                      currentItem.Admin2 === "Approved"
                        ? "text-green-600"
                        : currentItem.Admin2 === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {currentItem.Admin2}
                  </span>
                </div>
                {/* Admin 3 */}
                <div className="flex flex-col items-center bg-gray-50 p-5 rounded-lg shadow-md">
                  <i
                    className={`text-3xl mb-3 ${
                      currentItem.Admin3 === "Approved"
                        ? "fa-solid fa-check-circle text-green-600"
                        : currentItem.Admin3 === "Rejected"
                        ? "fa-solid fa-times-circle text-red-600"
                        : "fa-solid fa-hourglass-half text-yellow-600"
                    }`}
                  ></i>
                  <p className="text-lg text-gray-700 font-medium">
                    School Admin
                  </p>
                  <span
                    className={`text-xl font-semibold ${
                      currentItem.Admin3 === "Approved"
                        ? "text-green-600"
                        : currentItem.Admin3 === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {currentItem.Admin3}
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={closeViewModal}
                className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600 text-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {editModal && currentItem && (
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
              value={adminApproval}
              onChange={(e) => setAdminApproval(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Declined">Declined</option>
            </select>
            <button
              onClick={handleUpdate}
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
      {/* Reject Reason Modal */}
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
              onClick={handleUpdate} // Call handleUpdate directly
              className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold transition duration-200"
            >
              Submit Decline Reason
            </button>
          </div>
        </div>
      )}
    </>
  );
}
