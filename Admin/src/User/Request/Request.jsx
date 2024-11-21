import Sidebar from "../../Components/Sidebar";
import React, { useState, useEffect } from "react";
import { fetchData } from "../utilities/ApiUti";
import { toast } from "react-toastify";

export default function Request() {
  const [addModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [requests, setRequests] = useState([]);
  const [requestItem, setRequestItem] = useState({
    ItemName: "",
    Quantity: "",
    SuggestedDealer: "",
    Purpose: "",
    EstimatedCost: "",
    Description: "",
    Priority: "Low",
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openViewModal = (request) => {
    console.log(request);
    setSelectedRequest(request);
    setViewModalOpen(true);
  };
  const closeViewModal = () => setViewModalOpen(false);

  async function fetchRequests() {
    const loggedInUserId = localStorage.getItem("userId");
    const response = await fetchData(
      `http://localhost:5075/api/RequestItemsApi/GetRequestsByBorrower/${loggedInUserId}`,
      "GET"
    );
    setRequests(response);
    console.log(requests);
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  // Function to cancel a request
  async function handleCancelRequest(requestId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this request?"
    );
    if (!confirmed) return;

    try {
      // Using native fetch directly
      const response = await fetch(
        `http://localhost:5075/api/RequestItemsApi/CancelRequest/${requestId}`,
        {
          method: "PUT", // Adjust the method to match your API's requirements
          headers: {
            "Content-Type": "application/json", // Ensure the header is correct
          },
        }
      );

      const result = await response.json(); // Parse JSON response

      if (response.ok && result.success) {
        // Assuming your API responds with { success: true }
        toast.success("Request canceled successfully.");
        fetchRequests(); // Refresh the list of requests
      } else {
        // Handle API errors
        toast.error(
          result.message || `${requestId}Failed to cancel the request.`
        );
      }
    } catch (error) {
      console.error("Error canceling request:", error);
      toast.error("Failed to cancel the request. Please try again.");
    }
  }
  // Add request handling
  async function handleAddRequest(e) {
    e.preventDefault();
    const loggedInUsername = localStorage.getItem("username");
    const loggedInUserId = localStorage.getItem("userId");

    await fetchData(
      "http://localhost:5075/api/RequestItemsApi/InsertRequest",
      "POST",
      {
        requestID: 0,
        requestedItem: requestItem.ItemName,
        requestedBy: loggedInUsername,
        suggestedDealer: requestItem.SuggestedDealer,
        purpose: requestItem.Purpose,
        estimatedCost: requestItem.EstimatedCost,
        requestedDate: new Date().toISOString(),
        status: "Pending",
        priority: requestItem.Priority,
        admin1Approval: "Pending",
        admin2Approval: "Pending",
        admin3Approval: "Pending",
        borrowerId: loggedInUserId,
        description: requestItem.Description || "No description provided",
      }
    );

    closeModal();
    fetchRequests();
    toast.success("You submitted Your Request successfully!");
  }

  // Filter requests by status
  const filteredRequests =
    statusFilter === "All"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  return (
    <>
      <div className="flex h-screen gap-5">
        <Sidebar />

        <div className="limiter w-full">
          <div className="container mx-auto p-6">
            {/* Header Section */}
            <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-700">
                Request Overview
              </h2>
            </div>

            {/* Action Section */}
            <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex justify-between items-center">
              <button
                type="button"
                onClick={openModal}
                className="flex items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-semibold rounded-lg text-md px-5 py-2 transition duration-150"
              >
                <i className="fa-solid fa-plus mr-2"></i> Add Request
              </button>
              <select
                className="border rounded-lg px-4 py-2 text-gray-600 font-medium focus:ring-2 focus:ring-blue-300 transition duration-150"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full border-collapse border border-gray-200 bg-white">
                <thead className="bg-gray-200">
                  <tr className="font-semibold text-md text-zinc-50">
                    <th className="border border-gray-300 px-5 py-3">
                      Item Name
                    </th>
                    <th className="border border-gray-300 px-5 py-3">
                      Requested By
                    </th>

                    <th className="border border-gray-300 px-5 py-3">
                      Requested Date
                    </th>
                    <th className="border border-gray-300 px-5 py-3">
                      Suggested Dealer
                    </th>
                    <th className="border border-gray-300 px-5 py-3">
                      Purpose
                    </th>
                    <th className="border border-gray-300 px-5 py-3">
                      Estimated Cost
                    </th>
                    <th className="border border-gray-300 px-5 py-3">Status</th>
                    <th className="border border-gray-300 px-5 py-3 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request, index) => (
                    <tr
                      key={request.requestID}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition duration-200`}
                    >
                      <td className="border border-gray-300 px-5 py-3">
                        {request.requestedItem}
                      </td>
                      <td className="border border-gray-300 px-5 py-3">
                        {request.requestedBy}
                      </td>
                      <td className="border border-gray-300 px-5 py-3">
                        {request.requestedDate}
                      </td>
                      <td className="border border-gray-300 px-5 py-3">
                        {request.suggestedDealer}
                      </td>
                      <td className="border border-gray-300 px-5 py-3">
                        {request.purpose}
                      </td>
                      <td className="border border-gray-300 px-5 py-3">
                        {request.estimatedCost}
                      </td>
                      <td
                        className={`border border-gray-300 px-4 py-2 font-medium ${
                          request.status === "Pending"
                            ? "text-yellow-600"
                            : request.status === "Canceled"
                            ? "text-red-600"
                            : request.status === "In Progress"
                            ? "text-blue-600"
                            : request.status === "Rejected"
                            ? "text-red-600"
                            : request.status === "Approved"
                            ? "text-green-500"
                            : "text-green-600"
                        }`}
                      >
                        {request.status}
                      </td>
                      <td className="border border-gray-300 px-5 py-3 text-center">
                        <div className="flex  items-center gap-4">
                          <button
                            type="button"
                            onClick={() => openViewModal(request)}
                            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 transition duration-150"
                          >
                            <i className="fa-regular fa-eye"></i>
                          </button>
                          {request.status === "Pending" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCancelRequest(request.requestID)
                              }
                              className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-1.5 transition duration-150"
                            >
                              <i className="fa-solid fa-ban"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Request Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
              <div className="flex justify-between items-center">
                <h5 className="text-lg font-semibold">Request Form</h5>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <form onSubmit={handleAddRequest}>
                <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <input
                    className="bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="text"
                    onChange={(e) =>
                      setRequestItem({
                        ...requestItem,
                        ItemName: e.target.value,
                      })
                    }
                    value={requestItem.ItemName}
                    placeholder="Item Name"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="number"
                    placeholder="Quantity"
                    onChange={(e) =>
                      setRequestItem({
                        ...requestItem,
                        Quantity: e.target.value,
                      })
                    }
                    value={requestItem.Quantity}
                  />
                  <input
                    className="bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="text"
                    placeholder="Suggested Dealer"
                    onChange={(e) =>
                      setRequestItem({
                        ...requestItem,
                        SuggestedDealer: e.target.value,
                      })
                    }
                    value={requestItem.SuggestedDealer}
                  />
                  <input
                    className="bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="text"
                    placeholder="Purpose"
                    onChange={(e) =>
                      setRequestItem({
                        ...requestItem,
                        Purpose: e.target.value,
                      })
                    }
                    value={requestItem.Purpose}
                  />
                  <input
                    className="bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="number"
                    placeholder="Estimated Cost"
                    onChange={(e) =>
                      setRequestItem({
                        ...requestItem,
                        EstimatedCost: e.target.value,
                      })
                    }
                    value={requestItem.EstimatedCost}
                  />
                  <input
                    className="bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="text"
                    placeholder="Description"
                    onChange={(e) =>
                      setRequestItem({
                        ...requestItem,
                        Description: e.target.value,
                      })
                    }
                    value={requestItem.Description}
                  />
                  <select
                    className="bg-gray-100 text-gray-900 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    onChange={(e) =>
                      setRequestItem({
                        ...requestItem,
                        Priority: e.target.value,
                      })
                    }
                    value={requestItem.Priority}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Request Modal */}
        {viewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full mx-4 md:mx-0 transform transition-all duration-300 ease-in-out">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h5 className="text-2xl font-bold text-gray-800">
                  Request Details
                </h5>
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 transition duration-200 ease-in-out focus:outline-none"
                >
                  <i className="fa-solid fa-xmark text-2xl"></i>
                </button>
              </div>

              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Item Name:</span>
                  <span>{selectedRequest.requestedItem}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Requested By:</span>
                  <span>{selectedRequest.requestedBy}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Requested Date:</span>
                  <span>{selectedRequest.requestedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Suggested Dealer:</span>
                  <span>{selectedRequest.suggestedDealer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Purpose:</span>
                  <span>{selectedRequest.purpose}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Estimated Cost:</span>
                  <span>{selectedRequest.estimatedCost}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Status:</span>
                  <span className="text-blue-600 font-medium">
                    {selectedRequest.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Description:</span>
                  <span>{selectedRequest.description}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Priority:</span>
                  <span className="text-red-500 font-medium">
                    {selectedRequest.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
