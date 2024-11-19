import React, { useState, useEffect } from "react";

export default function BorrowedItems() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [adminApproval, setAdminApproval] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const storedUsername = localStorage.getItem("username");

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

  const closeDeclineModal = () => {
    setDeclineModalOpen(false);
    setDeclineReason("");
  };

  const handleUpdate = async () => {
    if (adminApproval === "Declined" && !declineReason) {
      setDeclineModalOpen(true); // Open decline reason modal if needed
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(
        `http://localhost:5075/api/BorrowRequestApi/UpdateApproval/${currentItem.BorrowId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admin1Approval: adminApproval,
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
      setDeclineReason(""); // Reset decline reason after submission
    } catch (error) {
      console.error("Error updating approval:", error.message);
      setError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.RequestedBy.toLowerCase().includes(searchQuery.toLowerCase()) &&
      item.Admin1Approval === "Pending"
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
              <table>
                <thead>
                  <tr className="table100-head">
                    <th className="column1">Borrow ID</th>
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
                    <tr key={item.BorrowId}>
                      <td className="column1">{item.BorrowId}</td>
                      <td className="column2">{item.RequestedBy}</td>
                      <td className="column3">{item.ReqBorrowDate}</td>
                      <td className="column4">{item.Purpose}</td>
                      <td className="column5">{item.Status}</td>
                      <td className="column6">{item.Admin1Approval}</td>
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
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
            <h2 className="text-2xl font-semibold mb-4">Borrowed Items</h2>
            {borrowLoading ? (
              <div>Loading borrowed items...</div>
            ) : borrowedItems.length === 0 ? (
              <div>No borrowed items found</div>
            ) : (
              <ul>
                {borrowedItems.map((borrowItem) => (
                  <li key={borrowItem.ItemId}>
                    Item: {borrowItem.ItemName} - Qty: {borrowItem.Quantity}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {updateModalOpen && currentItem && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
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
              Update Admin Approval
            </h2>
            <select
              value={adminApproval}
              onChange={(e) => setAdminApproval(e.target.value)}
              className="p-2 border rounded border-black w-full mb-4"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Declined">Declined</option>
            </select>
            <button
              onClick={handleUpdate}
              className={`text-white ${
                isUpdating ? "bg-gray-600" : "bg-green-600"
              } hover:bg-green-700 font-medium rounded-lg text-sm px-4 py-2`}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Approval"}
            </button>
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {declineModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={closeDeclineModal}
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
            <h2 className="text-2xl font-semibold mb-4">Decline Reason</h2>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="p-2 border rounded border-black w-full mb-4"
              placeholder="Enter reason for decline"
            />
            <button
              onClick={handleUpdate} // Updated to call handleUpdate directly
              className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-4 py-2"
            >
              Submit Decline Reason
            </button>
          </div>
        </div>
      )}
    </>
  );
}
