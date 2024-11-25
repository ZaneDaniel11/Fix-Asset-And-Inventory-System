import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function RequestItems() {
  const [updateModalOpen, setEditModalOpen] = useState(false);
  const [viewModal, setViewModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [admin1Approvals, setAdmin1Approval] = useState(""); // Corrected setter name
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const closeDeclineModal = () => setDeclineModalOpen(false);
  const storedUsername = localStorage.getItem("userType");
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
          Cost: item.estimatedCost,
          dealer: item.suggestedDealer,
          description: item.description,
        }));
        setItems(mappedItems);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const openEditModal = (item) => {
    setCurrentItem(item);
    setAdmin1Approval(item.Admin1);
    setEditModalOpen(true);
  };
  const closeEditModal = () => setEditModalOpen(false);

  const openViewModal = (item) => {
    setCurrentItem(item);
    setViewModalOpen(true);
  };
  const closeViewModal = () => setViewModalOpen(false);

  const handleSaveChanges = async () => {
    if (admin1Approvals === "Declined" && !declineReason) {
      setDeclineModalOpen(true);
      return;
    }

    setIsUpdating(true);

    try {
      const apiUrl = `http://localhost:5075/api/RequestItemsApi/Admin1UpdateApproval/${currentItem.id}`;
      const requestBody = {
        Admin1Approval: admin1Approvals,
        RejectReason: admin1Approvals === "Declined" ? declineReason : "",
        RejectBy: admin1Approvals === "Declined" ? storedUsername : "", // Replace "StoredUserName" with the actual variable
      };

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);

        let errorMessage = "Failed to update approval status.";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          console.warn("Error response is not JSON.");
        }

        alert(`Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      // Check for JSON response or handle empty response
      let responseData = null;
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        console.log("Non-JSON or empty response received.");
        responseData = {
          success: true,
          message: "Update completed successfully.",
        };
      }

      const updatedItems = items.map((item) =>
        item.id === currentItem.id
          ? {
              ...item,
              Admin1: admin1Approvals,
              status:
                admin1Approvals === "Approved" ? "In Progress" : "Rejected",
              DeclineReason:
                admin1Approvals === "Declined" ? declineReason : null,
            }
          : item
      );
      setItems(updatedItems);

      closeEditModal();
      toast.success(`Request Updated successfully!`);
      if (admin1Approvals === "Declined") {
        closeDeclineModal();
      }
      setDeclineReason("");
    } catch (error) {
      console.error("Error updating approval:", error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      item.status === "Pending" &&
      item.Admin1 === "Pending"
  );
  return (
    <>
      <div className="limiter w-full">
        <div className="container mx-auto p-6">
          {/* Header Section */}
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-700">Request List</h2>
          </div>

          {/* Search Input */}
          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search by Item Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded border-black"
            />
          </div>

          {/* Table */}
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
                  <th className="border border-gray-300 px-5 py-3">Admin1</th>
                  <th className="border border-gray-300 px-5 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
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
                      className={`border border-gray-300 px-5 py-3 ${
                        item.status === "Pending"
                          ? "text-yellow-600"
                          : item.status === "Canceled"
                          ? "text-red-600"
                          : item.status === "In Progress"
                          ? "text-blue-600"
                          : item.status === "Rejected"
                          ? "text-red-600"
                          : item.status === "Approved"
                          ? "text-green-500"
                          : "text-gray-600"
                      }`}
                    >
                      {item.status}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 ${
                        item.priority === "High"
                          ? "text-red-600 font-bold"
                          : item.priority === "Medium"
                          ? "text-yellow-600 font-medium"
                          : item.priority === "Low"
                          ? "text-green-600 font-light"
                          : "text-gray-600"
                      }`}
                    >
                      {item.priority}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 ${
                        item.Admin1 === "Pending"
                          ? "text-yellow-600"
                          : item.Admin1 === "Rejected"
                          ? "text-red-600"
                          : item.Admin1 === "Approved"
                          ? "text-green-500"
                          : "text-gray-600"
                      }`}
                    >
                      {item.Admin1}
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
                          className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-1.5"
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
              value={admin1Approvals}
              onChange={(e) => setAdmin1Approval(e.target.value)}
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

      {viewModal && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 md:mx-0 shadow-lg relative">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h5 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <i className="fa-solid fa-info-circle"></i> Item Details
              </h5>
              <button
                type="button"
                onClick={closeViewModal}
                className="text-gray-500 hover:text-red-600"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-box text-blue-500 text-lg"></i>
                <p>
                  <strong>Item Name:</strong> {currentItem.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-user text-green-500 text-lg"></i>
                <p>
                  <strong>Requested By:</strong> {currentItem.requestedBy}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-calendar-alt text-yellow-500 text-lg"></i>
                <p>
                  <strong>Requested Date:</strong> {currentItem.requestedDate}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <i
                  className={`fa-solid ${
                    currentItem.status === "Pending"
                      ? "fa-hourglass-half text-yellow-600"
                      : currentItem.status === "Approved"
                      ? "fa-check-circle text-green-500"
                      : currentItem.status === "Rejected"
                      ? "fa-times-circle text-red-600"
                      : "fa-info-circle text-gray-500"
                  } text-lg`}
                ></i>
                <p>
                  <strong>Status:</strong> {currentItem.status}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <i
                  className={`fa-solid fa-exclamation-circle ${
                    currentItem.priority === "High"
                      ? "text-red-600"
                      : currentItem.priority === "Medium"
                      ? "text-yellow-500"
                      : "text-green-500"
                  } text-lg`}
                ></i>
                <p>
                  <strong>Priority:</strong> {currentItem.priority}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-store text-purple-500 text-lg"></i>
                <p>
                  <strong>Suggested Dealer:</strong> {currentItem.dealer}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-dollar-sign text-green-500 text-lg"></i>
                <p>
                  <strong>Estimated Cost:</strong> {currentItem.Cost}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-file-alt text-gray-500 text-lg"></i>
                <p>
                  <strong>Description:</strong> {currentItem.description}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end mt-6 border-t pt-4">
              <button
                type="button"
                onClick={closeViewModal}
                className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600"
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
