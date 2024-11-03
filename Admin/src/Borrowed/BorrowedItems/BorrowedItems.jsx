import React, { useState, useEffect } from "react";

export default function BorrowedItems() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [returnStatusQuery, setReturnStatusQuery] = useState(""); // New state for return status filter
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [adminApproval, setAdminApproval] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [returnStatus, setReturnStatus] = useState(""); // New state for return status
  const [status, setStatus] = useState(""); // New state for main status

  const [borrowedItems, setBorrowedItems] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState(false);

  useEffect(() => {
    const fetchBorrowRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:5075/api/BorrowRequestApi/AllRequests"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch borrow requests");
        }
        const data = await response.json();
        setItems(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBorrowRequests();
  }, []);

  const fetchBorrowItems = async (borrowId) => {
    setBorrowLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5075/api/BorrowRequestApi/ViewRequest/${borrowId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch borrowed items");
      }
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

  const openUpdateModal = (item) => {
    setCurrentItem(item);
    setAdminApproval(item.Admin1Approval);
    setStatus(item.Status);
    setReturnStatus(item.ReturnStatus);
    setUpdateModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setCurrentItem(null);
    setBorrowedItems([]);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setCurrentItem(null);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updatedItem = {
        returnStatus: returnStatus,
      };

      const response = await fetch(
        `http://localhost:5075/api/BorrowRequestApi/UpdateReturnStatus/${currentItem.BorrowId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem),
        }
      );

      if (!response.ok) {
        console.log("Response status:", response.status);
        console.log("Response text:", await response.text());
        throw new Error("Failed to update borrow request");
      }

      closeUpdateModal();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter items based on search query, status, and return status
  const filteredItems = items.filter(
    (item) =>
      item.RequestedBy.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (returnStatusQuery === "" || item.ReturnStatus === returnStatusQuery) &&
      item.Admin3Approval === "Approved"
  );

  if (loading) {
    return <div>Loading borrow requests...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="limiter">
        <div className="container-table100">
          <div className="wrap-table100">
            <div className="table100">
              <div className="flex justify-between mb-4">
                <input
                  type="text"
                  placeholder="Search by Requester Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-2 border rounded border-black"
                />

                <select
                  value={returnStatusQuery}
                  onChange={(e) => setReturnStatusQuery(e.target.value)}
                  className="p-2 border rounded border-black"
                >
                  <option value="">All Return Statuses</option>
                  <option value="Returned">Returned</option>
                  <option value="Not Returned">Not Returned</option>
                </select>
              </div>
              <table>
                <thead>
                  <tr className="table100-head">
                    <th className="column1">Borrow ID</th>
                    <th className="column2">Requested By</th>
                    <th className="column3">Date</th>
                    <th className="column4">Purpose</th>
                    <th className="column5">Status</th>
                    <th className="column6">Approval</th>
                    <th className="column6">Approval2</th>
                    <th className="column6">Approval3</th>
                    <th className="column6">ReturnStatus</th>
                    <th className="column7">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.BorrowId}>
                      <td className="column1">{item.BorrowId}</td>
                      <td className="column2">{item.RequestedBy}</td>
                      <td className="column3">{item.ReqBorrowDate}</td>
                      <td className="column4">{item.Purpose}</td>
                      <td className="column5">{item.Status}</td>
                      <td className="column6">{item.Admin1Approval}</td>
                      <td className="column6">{item.Admin2Approval}</td>
                      <td className="column6">{item.Admin3Approval}</td>
                      <td className="column6">{item.ReturnStatus}</td>
                      <td className="flex items-center justify-center mt-2 space-x-2">
                        <button
                          type="button"
                          onClick={() => openViewModal(item)}
                          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => openUpdateModal(item)}
                          className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          <i className="fa-solid fa-edit"></i>
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

      {/* View Modal */}
      {viewModalOpen && currentItem && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={closeViewModal}
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
            <h2 className="text-2xl font-semibold mb-4">
              Borrowed Items for Request: {currentItem.BorrowId}
            </h2>
            {borrowLoading ? (
              <div>Loading items...</div>
            ) : (
              <ul>
                {borrowedItems.map((item, index) => (
                  <li key={index}>
                    <strong>Item Name:</strong> {item.ItemName}
                    <br />
                    <strong>Quantity:</strong> {item.Quantity}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Update Modal */}
      {updateModalOpen && currentItem && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={closeUpdateModal}
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
            <h2 className="text-2xl font-semibold mb-4">
              Update Borrow Request
            </h2>
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Select for Return Status */}
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Return Status
              </label>
              <select
                value={returnStatus}
                onChange={(e) => setReturnStatus(e.target.value)}
                className="w-full p-2 mb-4 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Returned">Returned</option>
                <option value="Not Returned">Not Returned</option>
              </select>

              {/* Update Button */}
              <button
                type="button"
                onClick={handleUpdate}
                className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
