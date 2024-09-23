import Sidebar from "../components/sidebar";
import React, { useState, useEffect } from "react";

export default function RequestItems() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [adminApproval, setAdminApproval] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  // Fetch the details of borrowed items for a specific borrow request
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

  // Open the modal to view borrowed items
  const openViewModal = (item) => {
    setCurrentItem(item);
    setViewModalOpen(true);
    fetchBorrowItems(item.BorrowId);
  };

  // Close the view modal
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
    setAdminApproval(""); // Reset the approval status
  };

  // Filter items based on search and status query
  const filteredItems = items.filter(
    (item) =>
      item.RequestedBy.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusQuery === "" || item.Status === statusQuery)
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
        <Sidebar />
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
                      <th className="column6">Admin1</th>
                      <th className="column6">Admin2</th>
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
                        <td className="column6">{item.Admin2Approval}</td>
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
                            className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5"
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
                      <span className="font-medium">{item.ItemName}</span> -{" "}
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
                <option value="Approved">Approved</option>
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
