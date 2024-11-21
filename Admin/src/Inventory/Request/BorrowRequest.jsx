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
      item.Admin1Approval === "Pending" &&
      item.Status === "Pending"
  );

  if (loading) {
    return <div>Loading borrow requests...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="limiter w-full">
        <div className="container mx-auto p-6">
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-700">Borrow Request</h2>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search by Requester Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded border-black"
            />
          </div>

          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full border-collapse border border-gray-200 bg-white">
              <thead className="bg-gray-200">
                <tr className="font-semibold text-md text-zinc-50">
                  <th className="border border-gray-300 px-5 py-3">
                    Borrow ID
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Requested By
                  </th>
                  <th className="border border-gray-300 px-5 py-3">Date</th>
                  <th className="border border-gray-300 px-5 py-3">Purpose</th>
                  <th className="border border-gray-300 px-5 py-3">Status</th>
                  <th className="border border-gray-300 px-5 py-3">Approval</th>
                  <th className="border border-gray-300 px-5 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.BorrowId}>
                    <td className="border border-gray-300 px-5 py-3">
                      {item.BorrowId}
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
                    <td className="border border-gray-300 px-5 py-3">
                      {item.Status}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {item.Admin1Approval}
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
                          onClick={() => openUpdateModal(item)}
                          className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          <i className="fa-solid fa-edit"></i>
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

      {/* View Modal */}
      {viewModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 relative">
            {/* Close Button */}
            <button
              onClick={closeViewModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl"
            >
              ✕
            </button>

            {/* Modal Title */}
            <h2 className="text-3xl font-bold text-gray-700 text-center mb-8">
              Borrowed Items
            </h2>

            {borrowLoading ? (
              <div className="text-center text-gray-500 text-lg">
                Loading borrowed items...
              </div>
            ) : borrowedItems.length === 0 ? (
              <div className="text-center text-gray-500 text-lg">
                No borrowed items found
              </div>
            ) : (
              <div className="space-y-6">
                {borrowedItems.map((borrowItem) => (
                  <div
                    key={borrowItem.ItemId}
                    className="flex items-center border border-gray-200 rounded-lg bg-gray-50 hover:shadow-lg transition-shadow duration-300 p-5"
                  >
                    {/* Image Section */}
                    <div className="flex-shrink-0">
                      <img
                        src="https://via.placeholder.com/100"
                        alt={borrowItem.ItemName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Content Section */}
                    <div className="ml-6 flex-1">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {borrowItem.ItemName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2">
                        Quantity:{" "}
                        <span className="font-medium text-gray-800">
                          {borrowItem.Quantity}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Update Modal */}
      {updateModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={closeUpdateModal}
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
              value={adminApproval}
              onChange={(e) => setAdminApproval(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Declined">Declined</option>
            </select>
            <button
              onClick={handleUpdate}
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

      {/* Decline Reason Modal */}
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
              onClick={handleUpdate} // Call handleUpdate directly
              className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold transition duration-200"
            >
              Submit Decline Reason
            </button>
          </div>
        </div>
      )}
    </>
  );
}
