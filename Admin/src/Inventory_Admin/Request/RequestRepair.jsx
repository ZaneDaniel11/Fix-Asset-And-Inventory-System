import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function MaintenanceRequests() {
  const API_URL = "http://localhost:5075/api/MaintenanceApi";
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setEditModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [admin1Approvals, setAdmin1Approval] = useState("Pending");
  const [declineReason, setDeclineReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const storedUsername = localStorage.getItem("name");

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/GetAllMaintenanceRequest`);
      const data = await response.json();
      const mappedItems = data.map((item) => ({
        id: item.maintenanceID,
        name: item.assetName,
        requestedBy: item.requestedBy,
        requestedDate: new Date(item.requestDate).toLocaleString(),
        status: item.approvalStatus,
        Admin1: item.approvedByAdmin1,
        issue: item.issue,
        description: item.description,
        location: item.location,
      }));
      setItems(mappedItems);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSaveChanges = async () => {
    if (admin1Approvals === "Declined" && !declineReason) {
      setDeclineModalOpen(true);
      return;
    }

    setIsUpdating(true);

    try {
      const apiUrl = `${API_URL}/Admin1UpdateApproval/${currentItem.id}`;
      const requestBody = {
        Admin1Approval: admin1Approvals,
        RejectReason: admin1Approvals === "Declined" ? declineReason : "",
        RejectBy: admin1Approvals === "Declined" ? storedUsername : "",
      };

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
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
      toast.success("Request updated successfully!");
      if (admin1Approvals === "Declined") closeDeclineModal();
      setDeclineReason("");
    } catch (error) {
      console.error("Error updating approval:", error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const openViewModal = (request) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
  };

  const openEditModal = (item) => {
    setCurrentItem(item);
    setAdmin1Approval(item.Admin1);
    setEditModalOpen(true);
  };

  const closeEditModal = () => setEditModalOpen(false);
  const closeDeclineModal = () => setDeclineModalOpen(false);
  const closeViewModal = () => setViewModalOpen(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      item.status === "Pending" &&
      item.Admin1 === "Pending"
  );

  return (
    <>
      <div className="limiter w-full">
        {/* Page Content */}
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-700">
              Maintenance Requests
            </h2>
          </div>

          {/* Search & Action */}
          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex justify-between items-center">
            <input
              type="text"
              className="border rounded-lg p-2 w-full"
              placeholder="Search Requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Requests Table */}
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full border-collapse border border-gray-200 bg-white">
              <thead className="bg-gray-200">
                <tr className="font-semibold text-md text-zinc-50">
                  <th className="border border-gray-300 px-5 py-3">
                    Request ID
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Asset Name
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Request Date
                  </th>
                  <th className="border border-gray-300 px-5 py-3">Location</th>
                  <th className="border border-gray-300 px-5 py-3">Issue</th>
                  <th className="border border-gray-300 px-5 py-3">Status</th>
                  <th className="border border-gray-300 px-5 py-3">Approval</th>
                  <th className="border border-gray-300 px-5 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((request, index) => (
                  <tr
                    key={request.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition duration-200`}
                  >
                    <td className="border border-gray-300 px-5 py-3">
                      {request.id}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {request.name}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {new Date(request.requestedDate).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {request.location}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {request.issue}
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-2 font-medium ${
                        request.status === "Pending"
                          ? "text-yellow-600"
                          : request.status === "Rejected"
                          ? "text-red-600"
                          : request.status === "Approved"
                          ? "text-green-500"
                          : "text-blue-600"
                      }`}
                    >
                      {request.status}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {request.Admin1}
                    </td>
                    <td className="border border-gray-300 px-5 py-3 text-center">
                      <div className="flex items-center gap-4 justify-center">
                        <button
                          onClick={() => openViewModal(request)}
                          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 transition duration-150"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(request)}
                          className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          Edit
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

      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full mx-4 md:mx-0 relative">
            <h5 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
              Request Details
            </h5>
            {selectedRequest && (
              <div className="space-y-4 text-gray-700">
                <p className="flex justify-between">
                  <span className="font-semibold">Request ID:</span>
                  <span>{selectedRequest.id}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Asset Name:</span>
                  <span>{selectedRequest.name}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Request Date:</span>
                  <span>
                    {new Date(
                      selectedRequest.requestedDate
                    ).toLocaleDateString()}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Location:</span>
                  <span>{selectedRequest.location}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Issue:</span>
                  <span>{selectedRequest.issue}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Description:</span>
                  <span>{selectedRequest.description}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full font-medium ${
                      selectedRequest.status === "Pending"
                        ? "bg-yellow-200 text-yellow-800"
                        : selectedRequest.status === "Approved"
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {selectedRequest.status}
                  </span>
                </p>
              </div>
            )}
            <div className="flex justify-end mt-8">
              <button
                onClick={closeViewModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-md transition duration-200 transform hover:scale-105"
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
