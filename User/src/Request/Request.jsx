import Sidebar from "../components/Sidebar";
import React, { useState, useEffect } from "react";
import { fetchData } from "../Utilities/ApiUtilitites";

export default function Request() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
    setSelectedRequest(request);
    setViewModalOpen(true);
  };
  const closeViewModal = () => setViewModalOpen(false);
  const closeDeleteModal = () => setDeleteModalOpen(false);

  const statusColors = {
    Pending: "bg-yellow-200 text-yellow-700",
    Approved: "bg-green-200 text-green-700",
    Rejected: "bg-red-200 text-red-700",
  };

  const statusIcons = {
    Pending: "fa-hourglass-start",
    Approved: "fa-check-circle",
    Rejected: "fa-times-circle",
  };

  async function fetchRequests() {
    const loggedInUserId = localStorage.getItem("userId");
    const response = await fetchData(
      `http://localhost:5075/api/RequestItemsApi/GetRequestsByBorrower/${loggedInUserId}`,
      "GET"
    );
    setRequests(response);
  }

  useEffect(() => {
    fetchRequests();
  }, []);

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
            {/* Shadowed div with text */}
            <div className="bg-gray-200 p-4 shadow-lg rounded-lg mb-6 text-center">
              <h2 className="text-2xl font-bold">Request Overview</h2>
            </div>

            {/* Input fields and buttons with shadow */}
            <div className="bg-white p-4 shadow-md rounded-lg mb-6 flex justify-between items-center">
              <button
                type="button"
                onClick={openModal}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
              >
                <i className="fa-solid fa-plus"></i> Add
              </button>
              <select
                className="border rounded-lg px-3 py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="overflow-x-auto shadow-lg rounded-lg">
              <table className="min-w-full text-left table-auto bg-white">
                <thead>
                  <tr className="table100-head text-white">
                    <th className="p-4">Requested by</th>
                    <th className="p-4">Requested Date</th>
                    <th className="p-4">Suggested Dealer</th>
                    <th className="p-4">Purpose</th>
                    <th className="p-4">Estimated Cost</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Operation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-t">
                      <td className="p-4">{request.requestedBy}</td>
                      <td className="p-4">{request.requestedDate}</td>
                      <td className="p-4">{request.suggestedDealer}</td>
                      <td className="p-4">{request.purpose}</td>
                      <td className="p-4">{request.estimatedCost}</td>
                      <td className={`p-4 ${statusColors[request.status]}`}>
                        <i
                          className={`fa-solid ${
                            statusIcons[request.status]
                          } me-2`}
                        ></i>
                        {request.status}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => openViewModal(request)}
                          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                        >
                          <i className="fa-regular fa-eye"></i>
                        </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
              <div className="flex justify-between items-center">
                <h5 className="text-lg font-semibold">Request Details</h5>
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="mt-4">
                <p>
                  <strong>Requested By:</strong> {selectedRequest.requestedBy}
                </p>
                <p>
                  <strong>Requested Date:</strong>{" "}
                  {selectedRequest.requestedDate}
                </p>
                <p>
                  <strong>Suggested Dealer:</strong>{" "}
                  {selectedRequest.suggestedDealer}
                </p>
                <p>
                  <strong>Purpose:</strong> {selectedRequest.purpose}
                </p>
                <p>
                  <strong>Estimated Cost:</strong>{" "}
                  {selectedRequest.estimatedCost}
                </p>
                <p>
                  <strong>Status:</strong> {selectedRequest.status}
                </p>
                <p>
                  <strong>Description:</strong> {selectedRequest.description}
                </p>
                <p>
                  <strong>Priority:</strong> {selectedRequest.priority}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
