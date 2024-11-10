import Sidebar from "../components/sidebar";
import React, { useState, useEffect } from "react";

export default function Borrow() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [declineReasonModalOpen, setDeclineReasonModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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
    const fetchApprovedBorrowRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:5075/api/BorrowRequestApi/ApprovedByAdmin1"
        );
        const data = await response.json();
        setItems(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedBorrowRequests();
  }, []);

  const handleUpdateApproval = async () => {
    if (adminApproval === "Declined" && !declineReason) {
      // Show the decline reason modal if Declined is selected but no reason is provided
      setDeclineReasonModalOpen(true);
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch(
        `http://localhost:5075/api/BorrowRequestApi/UpdateApprovalAdmin2/${currentItem.BorrowId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admin2Approval: adminApproval,
            rejectReason: adminApproval === "Declined" ? declineReason : "",
            rejectBy: adminApproval === "Declined" ? storedUsername : "",
          }),
        }
      );

      if (response.ok) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.BorrowId === currentItem.BorrowId
              ? { ...item, Admin2Approval: adminApproval }
              : item
          )
        );
        closeUpdateModal();
      } else {
        console.error("Failed to update approval");
      }
    } catch (error) {
      console.error("Error updating approval", error);
    } finally {
      setIsUpdating(false);
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

  const closeViewModal = () => {
    setViewModalOpen(false);
    setCurrentItem(null);
    setBorrowedItems([]);
  };

  const openUpdateModal = (item) => {
    setCurrentItem(item);
    setUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setCurrentItem(null);
    setAdminApproval("");
    setDeclineReason("");
    setDeclineReasonModalOpen(false);
  };

  const handleAdminApprovalChange = (value) => {
    setAdminApproval(value);
    if (value === "Declined") {
      setDeclineReasonModalOpen(true);
    } else {
      setDeclineReasonModalOpen(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.Admin2Approval === "Pending" &&
      item.RequestedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading approved borrow requests...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">Error: {error}</div>;
  }

  return (
    <>
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto p-6">
          <div className="bg-gray-200 p-4 shadow-lg rounded-lg mb-6 text-center">
            <h2 className="text-2xl font-bold">Borrow Overview</h2>
          </div>
          <div className="flex justify-between mb-4 shadow-lg p-6 bg-white rounded-lg mb-6">
            <input
              type="text"
              placeholder="Search by Requester Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border border-gray-300 rounded w-full max-w-sm"
            />
          </div>

          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-white uppercase bg-gray-100">
                <tr>
                  <th className="px-6 py-3">Borrow ID</th>
                  <th className="px-6 py-3">Requested By</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Purpose</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Admin1</th>
                  <th className="px-6 py-3">Admin2</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.BorrowId} className="bg-white border-b">
                    <td className="px-6 py-4">{item.BorrowId}</td>
                    <td className="px-6 py-4">{item.RequestedBy}</td>
                    <td className="px-6 py-4">{item.ReqBorrowDate}</td>
                    <td className="px-6 py-4">{item.Purpose}</td>
                    <td className="px-6 py-4">{item.Status}</td>
                    <td className="px-6 py-4">{item.Admin1Approval}</td>
                    <td className="px-6 py-4">{item.Admin2Approval}</td>
                    <td className="px-6 py-4 flex justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => openViewModal(item)}
                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => openUpdateModal(item)}
                        className="text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Decline Reason Modal */}
      {declineReasonModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setDeclineReasonModalOpen(false)}
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
              Reason for Declining
            </h2>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="p-2 border border-gray-300 rounded w-full"
              placeholder="Enter reason for declining"
            ></textarea>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => handleUpdateApproval()}
                className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md"
              >
                Submit Reason & Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Update Approval</h2>
            <select
              value={adminApproval}
              onChange={(e) => handleAdminApprovalChange(e.target.value)}
              className="p-2 border border-gray-300 rounded w-full mb-4"
            >
              <option value="">Select Approval</option>
              <option value="Approved">Approved</option>
              <option value="Declined">Declined</option>
            </select>
            {adminApproval === "Declined" && (
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="p-2 border border-gray-300 rounded w-full mb-4"
                placeholder="Enter reason for declining"
              ></textarea>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeUpdateModal}
                className="text-white bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateApproval}
                className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold mb-4">View Borrowed Items</h2>
            <ul>
              {borrowedItems.map((item) => (
                <li key={item.ItemID} className="mb-2">
                  {item.ItemName} (Quantity: {item.Quantity})
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeViewModal}
                className="text-white bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-md"
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
