import Sidebar from "../components/sidebar";
import React, { useState, useEffect } from "react";

export default function Admin1Logs() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [adminApproval, setAdminApproval] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch only approved borrow requests
  useEffect(() => {
    const fetchApprovedBorrowRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:5075/api/BorrowRequestApi/ApprovedByAdmin1"
        );
        const data = await response.json();
        console.log(data); // Check data structure
        setItems(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedBorrowRequests();
  }, []);

  // Function to open view modal and fetch borrowed items
  const openViewModal = async (item) => {
    setCurrentItem(item);
    setViewModalOpen(true);
    setBorrowLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5075/api/BorrowRequestApi/ViewRequest/${item.BorrowId}`
      );
      const data = await response.json();
      setBorrowedItems(data); // Assuming the response contains the items
    } catch (error) {
      console.error("Error fetching borrowed items:", error);
    } finally {
      setBorrowLoading(false);
    }
  };

  // Function to close view modal
  const closeViewModal = () => {
    setViewModalOpen(false);
    setCurrentItem(null);
    setBorrowedItems([]);
  };

  // Function to open update modal
  const openUpdateModal = (item) => {
    setCurrentItem(item);
    setUpdateModalOpen(true);
  };

  // Function to close update modal
  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setCurrentItem(null);
    setAdminApproval("");
  };

  // Handle the Admin2 approval update
  const handleUpdateApproval = async () => {
    if (!adminApproval) return;

    try {
      setIsUpdating(true);
      const response = await fetch(
        `http://localhost:5075/api/BorrowRequestApi/UpdateApprovalAdmin2/${currentItem.BorrowId}`,
        {
          method: "PUT", // <-- Change this to PUT
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Admin2Approval: adminApproval }),
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

  // Filter items based on Admin2Approval being "Accepted" or "Rejected"
  const filteredItems = items.filter(
    (item) =>
      item.Admin2Approval === "Approved" || item.Admin2Approval === "Rejected"
  );

  if (loading) {
    return <div>Loading approved borrow requests...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="container mx-auto bg-white shadow-md rounded-lg p-6">
            <div className="bg-gray-200 p-4 shadow-lg rounded-lg mb-6 text-center">
              <h2 className="text-2xl font-bold">Logs Overview</h2>
            </div>
            {/* Search and Filter Section */}
            <div className="flex justify-between mb-4 shadow-lg p-6 bg-white rounded-lg mb-6">
              <input
                type="text"
                placeholder="Search by Requester Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-3 border rounded-lg shadow-sm border-gray-300"
              />

              {/* Filter by Admin2 Approval Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-3 border rounded-lg shadow-sm border-gray-300 ml-4"
              >
                <option value="">All</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Table */}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="bg-gray-100 text-white">
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
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.BorrowId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{item.BorrowId}</td>
                      <td className="px-6 py-4">{item.RequestedBy}</td>
                      <td className="px-6 py-4">{item.ReqBorrowDate}</td>
                      <td className="px-6 py-4">{item.Purpose}</td>
                      <td className="px-6 py-4">{item.Status}</td>
                      <td className="px-6 py-4">{item.Admin1Approval}</td>
                      <td className="px-6 py-4">{item.Admin2Approval}</td>
                      <td className="flex justify-center items-center space-x-2 py-4">
                        <button
                          type="button"
                          onClick={() => openViewModal(item)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-2 rounded-lg"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => openUpdateModal(item)}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-2 rounded-lg"
                        >
                          Update Approval
                        </button>
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
              <h2 className="text-2xl font-semibold mb-4">
                Borrowed Items for Borrow ID: {currentItem.BorrowId}
              </h2>
              {borrowLoading ? (
                <div>Loading borrowed items...</div>
              ) : borrowedItems.length > 0 ? (
                <ul className="space-y-2">
                  {borrowedItems.map((item) => (
                    <li
                      key={item.ItemId}
                      className="border-b pb-2 border-gray-200"
                    >
                      <span className="font-medium">{item.ItemName}</span> -
                      Quantity: {item.Quantity}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">
                  No items found for this borrow request.
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={closeViewModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
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
                Update Approval for Borrow ID: {currentItem.BorrowId}
              </h2>
              <label className="block mb-2">Admin2 Approval Status:</label>
              <select
                value={adminApproval}
                onChange={(e) => setAdminApproval(e.target.value)}
                className="p-2 border rounded border-gray-300 w-full"
              >
                <option value="">Select Status</option>
                <option value="Approved">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleUpdateApproval}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
