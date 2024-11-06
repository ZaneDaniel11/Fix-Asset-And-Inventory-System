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

  useEffect(() => {
    if (activeTab === "Borrow Items") {
      fetchBorrowRequests();
    } else if (activeTab === "Requested Items") {
      fetchRequestedItems();
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
        `http://localhost:5075/api/BorrowItemsApi/${borrowId}`
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
      </div>

      {/* Search Bar */}
      <div className="p-4 mb-4 bg-white shadow-md rounded-md">
        <div className="flex justify-between">
          <input
            type="text"
            placeholder="Search by Requester Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded border-gray-400 w-1/2"
          />
          <select
            value={statusQuery}
            onChange={(e) => setStatusQuery(e.target.value)}
            className="p-2 border rounded border-gray-400"
          >
            <option value="">All Statuses</option>
            <option value="Complete">Complete</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      {activeTab === "Borrow Items" && (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="table100-head">
                <th className="column1">ID</th>
                <th className="column2">Requested By</th>
                <th className="column3">Date</th>
                <th className="column4">Purpose</th>
                <th className="column5">Status</th>
                <th className="column6">Approval</th>
                <th className="column7" style={{ paddingRight: 20 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.BorrowId || item.RequestId}>
                  <td className="column1">{item.BorrowId || item.RequestId}</td>
                  <td className="column2">{item.RequestedBy}</td>
                  <td className="column3">{item.ReqBorrowDate}</td>
                  <td className="column4">{item.Purpose}</td>
                  <td className="column5">{item.Status}</td>
                  <td className="column6">{item.Admin1Approval}</td>
                  <td className="flex items-center justify-center mt-2 space-x-2">
                    <button
                      type="button"
                      onClick={() => openViewModal(item, "Borrow")}
                      className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Requested Items Table */}
      {activeTab === "Requested Items" && (
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
                    <i className={`fa ${statusIcons[request.status]} mr-1`}></i>
                    {request.status}
                  </td>
                  <td className="flex items-center justify-center mt-2 space-x-2">
                    <button
                      type="button"
                      onClick={() => openViewModal(request, "Requested")}
                      className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Borrow Modal */}
      {viewBorrowModalOpen && currentItem && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h3 className="text-2xl font-bold mb-4">Borrow Item Details</h3>
            <div className="space-y-2">
              <p>
                <strong>ID:</strong> {currentItem.BorrowId}
              </p>
              <p>
                <strong>Requested By:</strong> {currentItem.RequestedBy}
              </p>
              <p>
                <strong>Request Date:</strong> {currentItem.ReqBorrowDate}
              </p>
              <p>
                <strong>Purpose:</strong> {currentItem.Purpose}
              </p>
              <p>
                <strong>Status:</strong> {currentItem.Status}
              </p>
              <p>
                <strong>Approval:</strong> {currentItem.Admin1Approval}
              </p>
            </div>
            <hr className="my-4" />
            <h4 className="text-xl font-semibold mb-2">Borrowed Items</h4>
            <ul className="list-disc list-inside space-y-1">
              {borrowedItems.map((item, index) => (
                <li key={index}>
                  <p>
                    <strong>Item Name:</strong> {item.name}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {item.quantity}
                  </p>
                  <p>
                    <strong>Description:</strong> {item.description}
                  </p>
                </li>
              ))}
            </ul>
            <button
              onClick={closeBorrowModal}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Requested Modal */}
      {viewRequestedModalOpen && currentItem && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h3 className="text-2xl font-bold mb-4">Requested Item Details</h3>
            <div className="space-y-2">
              <p>
                <strong>ID:</strong> {currentItem.id}
              </p>
              <p>
                <strong>Requested By:</strong> {currentItem.requestedBy}
              </p>
              <p>
                <strong>Requested Date:</strong> {currentItem.requestedDate}
              </p>
              <p>
                <strong>Suggested Dealer:</strong> {currentItem.suggestedDealer}
              </p>
              <p>
                <strong>Purpose:</strong> {currentItem.purpose}
              </p>
              <p>
                <strong>Estimated Cost:</strong> {currentItem.estimatedCost}
              </p>
              <p>
                <strong>Status:</strong> {currentItem.status}
              </p>
            </div>
            <button
              onClick={closeRequestedModal}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
