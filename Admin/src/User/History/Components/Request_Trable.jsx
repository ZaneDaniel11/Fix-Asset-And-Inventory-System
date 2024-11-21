import React, { useState, useEffect } from "react";

export default function Request_History() {
  const [viewBorrowModalOpen, setViewBorrowModalOpen] = useState(false);
  const [viewRequestedModalOpen, setViewRequestedModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [items, setItems] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Borrow Items");
  const [requests, setRequests] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedRequest(null);
  };

  useEffect(() => {
    if (activeTab === "Borrow Items") {
      fetchBorrowRequests();
    } else if (activeTab === "Requested Items") {
      fetchRequestedItems();
    } else if (activeTab === "Maintenance Request") {
      fetchMaintenanceRequests();
    }
  }, [activeTab]);

  const statusColors = {
    Pending: "text-orange-400",
    Approved: "text-green-700",
    Rejected: "text-red-700",
  };

  const statusIcons = {
    Pending: "fa-hourglass-start",
    Approved: "fa-check-circle",
    Rejected: "fa-times-circle",
  };

  const fetchMaintenanceRequests = async () => {
    const borrowerId = localStorage.getItem("userId");
    try {
      const response = await fetch(
        `http://localhost:5075/api/MaintenanceApi/GetMaintenanceByRequester/${borrowerId}`
      );
      if (!response.ok) throw new Error("Failed to fetch maintenance requests");
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      setError(error.message);
    }
  };

  const fetchBorrowRequests = async () => {
    setLoading(true);
    const borrowerId = localStorage.getItem("userId");
    if (!borrowerId) {
      setError("User ID is not available in localStorage");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5075/api/BorrowRequestApi/RequestById/${borrowerId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch borrow requests");
      }

      const data = await response.json();
      setItems(Array.isArray(data) ? data : [data]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestedItems = async () => {
    setLoading(true);
    const requesterId = localStorage.getItem("userId");
    if (!requesterId) {
      setError("User ID is not available in localStorage");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5075/api/RequestItemsApi/GetRequestsByBorrower/${requesterId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch requested items");
      }

      const data = await response.json();
      setFilteredRequests(Array.isArray(data) ? data : [data]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
      setBorrowedItems(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    } finally {
      setBorrowLoading(false);
    }
  };

  const openViewModal = (item, type) => {
    setCurrentItem(item);
    if (type === "Borrow") {
      setViewBorrowModalOpen(true);
      fetchBorrowItems(item.BorrowId);
    } else if (type === "Requested") {
      setViewRequestedModalOpen(true);
    } else if (type === "Maintenance") {
      setSelectedRequest(item);
      setViewModalOpen(true);
    }
  };

  const closeBorrowModal = () => {
    setViewBorrowModalOpen(false);
    setCurrentItem(null);
    setBorrowedItems([]);
  };

  const closeRequestedModal = () => {
    setViewRequestedModalOpen(false);
    setCurrentItem(null);
  };

  const filteredItems = Array.isArray(items)
    ? items.filter(
        (item) =>
          item.RequestedBy.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (statusQuery === "" || item.Status === statusQuery)
      )
    : [];

  if (loading) {
    return <div>Loading {activeTab.toLowerCase()}...</div>;
  }

  return (
    <div className="flex-grow p-6">
      <div className="bg-gray-200 p-4 shadow-lg rounded-lg mb-6 text-center">
        <h2 className="text-2xl font-bold">Request History</h2>
      </div>

      {/* Tab Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("Borrow Items")}
          className={`${
            activeTab === "Borrow Items"
              ? "bg-blue-700 text-white"
              : "bg-gray-300"
          } font-medium rounded-lg px-4 py-2`}
        >
          Borrow Items
        </button>
        <button
          onClick={() => setActiveTab("Requested Items")}
          className={`${
            activeTab === "Requested Items"
              ? "bg-blue-700 text-white"
              : "bg-gray-300"
          } font-medium rounded-lg px-4 py-2`}
        >
          Requested Items
        </button>
        <button
          onClick={() => setActiveTab("Maintenance Request")}
          className={`${
            activeTab === "Maintenance Request"
              ? "bg-blue-700 text-white"
              : "bg-gray-300"
          } font-medium rounded-lg px-4 py-2`}
        >
          Maintenance Request
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 mb-4 bg-white shadow-md rounded-md">
        <div className="flex justify-between">
          {/* <input
            type="text"
            placeholder="Search by Requester Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded border-gray-400 w-1/2"
          /> */}
          <select
            value={statusQuery}
            onChange={(e) => setStatusQuery(e.target.value)}
            className="p-2 border rounded border-gray-400"
          >
            <option value="">All Statuses</option>
            <option value="Complete">Complete</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      {activeTab === "Borrow Items" && (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full border-collapse border border-gray-200 bg-white">
            <thead className="bg-gray-200">
              <tr className="font-semibold text-md text-zinc-50">
                <th className="border border-gray-300 px-5 py-3">ID</th>
                <th className="border border-gray-300 px-5 py-3">
                  Requested By
                </th>
                <th className="border border-gray-300 px-5 py-3">Date</th>
                <th className="border border-gray-300 px-5 py-3">Purpose</th>
                <th className="border border-gray-300 px-5 py-3">Status</th>
                <th className="border border-gray-300 px-5 py-3">Aproval</th>
                <th className="border border-gray-300 px-5 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr
                  key={item.BorrowId || item.RequestId}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition duration-200`}
                >
                  <td className="border border-gray-300 px-5 py-3">
                    {item.BorrowId || item.RequestId}
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
                    {item.Status}
                  </td>
                  <td className="border border-gray-300 px-5 py-3">
                    {item.Admin1Approval}
                  </td>
                  <td className="border border-gray-300 px-5 py-3 text-center">
                    <div className="flex items-center gap-4 justify-center">
                      <button
                        type="button"
                        onClick={() => openViewModal(item, "Borrow")}
                        className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 transition duration-150"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Maintenance Request" && (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full border-collapse border border-gray-200 bg-white">
            <thead className="bg-gray-200">
              <tr className="font-semibold text-md text-zinc-50">
                <th className="border border-gray-300 px-5 py-3">Request ID</th>
                <th className="border border-gray-300 px-5 py-3">Asset Name</th>
                <th className="border border-gray-300 px-5 py-3">
                  Request Date
                </th>
                <th className="border border-gray-300 px-5 py-3">Location</th>
                <th className="border border-gray-300 px-5 py-3">Issue</th>
                <th className="border border-gray-300 px-5 py-3">Status</th>
                <th className="border border-gray-300 px-5 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <tr
                  key={request.maintenanceID}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition duration-200`}
                >
                  <td className="border border-gray-300 px-5 py-3">
                    {request.maintenanceID}
                  </td>
                  <td className="border border-gray-300 px-5 py-3">
                    {request.assetName}
                  </td>
                  <td className="border border-gray-300 px-5 py-3">
                    {new Date(request.requestDate).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-5 py-3">
                    {request.location}
                  </td>
                  <td className="border border-gray-300 px-5 py-3">
                    {request.issue}
                  </td>
                  <td
                    className={`border border-gray-300 px-4 py-2 font-medium ${
                      request.maintenanceStatus === "Pending"
                        ? "text-yellow-600"
                        : request.maintenanceStatus === "Rejected"
                        ? "text-red-600"
                        : request.maintenanceStatus === "Approved"
                        ? "text-green-500"
                        : "text-blue-600"
                    }`}
                  >
                    {request.maintenanceStatus}
                  </td>
                  <td className="border border-gray-300 px-5 py-3 text-center">
                    <div className="flex items-center gap-4 justify-center">
                      <button
                        type="button"
                        onClick={() => openViewModal(request, "Maintenance")}
                        className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 transition duration-150"
                      >
                        <i className="fa-regular fa-eye"></i> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === "Requested Items" && (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full border-collapse border border-gray-200 bg-white">
            <thead className="bg-gray-200">
              <tr className="font-semibold text-md text-zinc-50">
                <th className="border border-gray-300 px-5 py-3">
                  Requested By
                </th>
                <th className="border border-gray-300 px-5 py-3">
                  Requested Date
                </th>
                <th className="border border-gray-300 px-5 py-3">
                  Suggested Dealer
                </th>
                <th className="border border-gray-300 px-5 py-3">Purpose</th>
                <th className="border border-gray-300 px-5 py-3">
                  Estimated Cost
                </th>
                <th className="border border-gray-300 px-5 py-3">Status</th>
                <th className="border border-gray-300 px-5 py-3 text-center">
                  Operation
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request, index) => (
                <tr
                  key={request.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition duration-200`}
                >
                  <td className="border border-gray-300 px-5 py-3">
                    {request.requestedBy}
                  </td>
                  <td className="border border-gray-300 px-5 py-3">
                    {new Date(request.requestedDate).toLocaleDateString()}
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
                        : request.status === "Rejected"
                        ? "text-red-600"
                        : request.status === "Approved"
                        ? "text-green-500"
                        : "text-blue-600"
                    }`}
                  >
                    <i
                      className={`fa ${
                        request.status === "Pending"
                          ? "fa-hourglass-half"
                          : request.status === "Rejected"
                          ? "fa-times-circle"
                          : request.status === "Approved"
                          ? "fa-check-circle"
                          : "fa-info-circle"
                      } mr-1`}
                    ></i>
                    {request.status}
                  </td>
                  <td className="border border-gray-300 px-5 py-3 text-center">
                    <div className="flex items-center gap-4 justify-center">
                      <button
                        type="button"
                        onClick={() => openViewModal(request, "Requested")}
                        className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 transition duration-150"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Borrow Modal */}
      {viewBorrowModalOpen && currentItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-3/4 max-w-5xl p-8 overflow-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-box-archive text-blue-600"></i> Borrow
                Item Details
              </h3>
              <button
                onClick={closeBorrowModal}
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
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-thumbs-up text-blue-500"></i>
                  <span>
                    <strong>Approval:</strong> {currentItem.Admin1Approval}
                  </span>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            {/* Borrowed Items Section */}
            <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <i className="fa-solid fa-boxes-stacked text-green-600"></i>{" "}
              Borrowed Items
            </h4>
            <ul className="space-y-4">
              {borrowedItems.map((item) => (
                <div
                  key={item.ItemId}
                  className="flex items-center gap-6 border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Image Section */}
                  <img
                    src="https://via.placeholder.com/100"
                    alt={item.ItemName}
                    className="w-24 h-24 object-cover rounded-lg shadow-sm"
                  />

                  {/* Content Section */}
                  <div className="flex-1">
                    <h5 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <i className="fa-solid fa-cube text-indigo-500"></i>{" "}
                      {item.ItemName}
                    </h5>
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                      <i className="fa-solid fa-cubes text-indigo-400"></i>{" "}
                      Quantity:{" "}
                      <span className="font-medium text-gray-800">
                        {item.Quantity}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </ul>

            {/* Modal Footer */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={closeBorrowModal}
                className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-200 flex items-center gap-2"
              >
                <i className="fa-solid fa-circle-xmark"></i> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requested Modal */}
      {viewRequestedModalOpen && currentItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-3/4 max-w-5xl p-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-file-alt text-blue-600"></i> Requested
                Item Details
              </h3>
              <button
                onClick={closeRequestedModal}
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
                    <strong>Requested Date:</strong> {currentItem.requestedDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-store text-blue-500"></i>
                  <span>
                    <strong>Suggested Dealer:</strong>{" "}
                    {currentItem.suggestedDealer}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-bullseye text-blue-500"></i>
                  <span>
                    <strong>Purpose:</strong> {currentItem.purpose}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-dollar-sign text-green-500"></i>
                  <span>
                    <strong>Estimated Cost:</strong> {currentItem.estimatedCost}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i
                    className={`fa ${
                      statusIcons[currentItem.status]
                    } text-blue-500`}
                  ></i>
                  <span>
                    <strong>Status:</strong> {currentItem.status}
                  </span>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            {/* Modal Footer */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={closeRequestedModal}
                className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-200 flex items-center gap-2"
              >
                <i className="fa-solid fa-circle-xmark"></i> Close
              </button>
            </div>
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
                  <span>{selectedRequest.maintenanceID}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Asset Name:</span>
                  <span>{selectedRequest.assetName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Request Date:</span>
                  <span>
                    {new Date(selectedRequest.requestDate).toLocaleDateString()}
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
                      selectedRequest.maintenanceStatus === "Pending"
                        ? "bg-yellow-200 text-yellow-800"
                        : selectedRequest.maintenanceStatus === "Approved"
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {selectedRequest.maintenanceStatus}
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
    </div>
  );
}
