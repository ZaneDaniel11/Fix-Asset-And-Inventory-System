import Sidebar from "../components/Sidebar";
import React, { useState, useEffect } from "react";
import { fetchData } from "../Utilities/ApiUtilitites";

export default function Request() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [add_modal, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [requests, setRequests] = useState([]); // Dynamic requests
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const [RequestItem, SetRequestItem] = useState({
    ItemName: "",
    Quantity: "",
    suggestedDealer: "",
    Purpose: "",
    EstimatedCost: "",
    Description: "",
    Priority: "", // Default value
  });

  async function fetchRequests() {
    const LoggedborrowerId = localStorage.getItem("userId");
    const response = await fetchData(
      `http://localhost:5075/api/RequestItemsApi/GetRequestsByBorrower/${LoggedborrowerId}`,
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
    const LoggedborrowerId = localStorage.getItem("userId");

    await fetchData(
      "http://localhost:5075/api/RequestItemsApi/InsertRequest",
      "POST",
      {
        requestID: 0,
        requestedItem: RequestItem.ItemName,
        requestedBy: loggedInUsername,
        suggestedDealer: RequestItem.suggestedDealer,
        purpose: RequestItem.Purpose,
        estimatedCost: RequestItem.EstimatedCost,
        requestedDate: new Date().toISOString(),
        status: "Pending",
        priority: RequestItem.Priority,
        admin1Approval: "Pending",
        admin2Approval: "Pending",
        admin3Approval: "Pending",
        borrowerId: LoggedborrowerId,
        description: RequestItem.Description || "No description provided",
      }
    );

    // Close modal and refresh the request list
    closeModal();
    fetchRequests();
  }

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

  // Filter requests by status
  const filteredRequests =
    statusFilter === "All"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  return (
    <>
      <div className="flex h-screen gap-5">
        <Sidebar />

        <div className="limiter">
          <div className="container-table100">
            <div className="wrap-table100">
              <div className="table100">
                <div className="flex justify-between mb-4">
                  <button
                    type="button"
                    onClick={openModal}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
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
                <table>
                  <thead>
                    <tr className="table100-head">
                      <th className="column2">Requested by</th>
                      <th className="column3">Requested Date</th>
                      <th className="column4">Suggested Dealer</th>
                      <th className="column5">Purpose</th>
                      <th className="column3">Estimated Cost</th>
                      <th className="column6">Status</th>
                      <th className="column6 text-white">Operation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="column2">{request.requestedBy}</td>
                        <td className="column3">{request.requestedDate}</td>
                        <td className="column3">{request.suggestedDealer}</td>
                        <td className="column4">{request.purpose}</td>
                        <td className="column6">{request.estimatedCost}</td>
                        <td
                          className={`column6 ${statusColors[request.status]}`}
                        >
                          <i
                            className={`fa-solid ${
                              statusIcons[request.status]
                            } me-2`}
                          ></i>
                          {request.status}
                        </td>
                        <td className="flex items-center justify-center mt-2">
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
        </div>

        {add_modal && (
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
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
                    <input
                      className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                      type="text"
                      onChange={(e) =>
                        SetRequestItem({
                          ...RequestItem,
                          ItemName: e.target.value,
                        })
                      }
                      value={RequestItem.ItemName}
                      placeholder="Item Name"
                    />
                    <input
                      className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                      type="number"
                      placeholder="Quantity"
                      onChange={(e) =>
                        SetRequestItem({
                          ...RequestItem,
                          Quantity: e.target.value,
                        })
                      }
                      value={RequestItem.Quantity}
                    />
                    <input
                      className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                      type="text"
                      placeholder="Suggested Dealer"
                      onChange={(e) =>
                        SetRequestItem({
                          ...RequestItem,
                          suggestedDealer: e.target.value,
                        })
                      }
                      value={RequestItem.suggestedDealer}
                    />
                    <input
                      className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                      type="text"
                      placeholder="Purpose"
                      onChange={(e) =>
                        SetRequestItem({
                          ...RequestItem,
                          Purpose: e.target.value,
                        })
                      }
                      value={RequestItem.Purpose}
                    />
                    <input
                      onChange={(e) =>
                        SetRequestItem({
                          ...RequestItem,
                          EstimatedCost: e.target.value,
                        })
                      }
                      value={RequestItem.EstimatedCost}
                      className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                      type="number"
                      placeholder="Estimated Cost"
                    />
                    <input
                      onChange={(e) =>
                        SetRequestItem({
                          ...RequestItem,
                          Description: e.target.value,
                        })
                      }
                      value={RequestItem.Description}
                      className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                      type="text"
                      placeholder="Description"
                    />
                    <select
                      className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                      value={RequestItem.Priority}
                      onChange={(e) =>
                        SetRequestItem({
                          ...RequestItem,
                          Priority: e.target.value,
                        })
                      }
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-gray-700 bg-white border border-gray-300 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
              <div className="flex justify-between items-center">
                <h5 className="text-lg font-semibold">
                  Request Details - {selectedRequest?.requestedItem}
                </h5>
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
                  <strong>Requested by:</strong> {selectedRequest?.requestedBy}
                </p>
                <p>
                  <strong>Requested Date:</strong>{" "}
                  {selectedRequest?.requestedDate}
                </p>
                <p>
                  <strong>Suggested Dealer:</strong>{" "}
                  {selectedRequest?.suggestedDealer}
                </p>
                <p>
                  <strong>Purpose:</strong> {selectedRequest?.purpose}
                </p>
                <p>
                  <strong>Estimated Cost:</strong>{" "}
                  {selectedRequest?.estimatedCost}
                </p>
                <p>
                  <strong>Priority:</strong> {selectedRequest?.priority}
                </p>
                <p>
                  <strong>Status:</strong> {selectedRequest?.status}
                </p>
                <p>
                  <strong>Description:</strong> {selectedRequest?.description}
                </p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
