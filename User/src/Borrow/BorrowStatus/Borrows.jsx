import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

export default function BorrowStatus() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState(false);

  useEffect(() => {
    const fetchBorrowRequests = async () => {
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
        console.log("API Response:", data);

        if (Array.isArray(data)) {
          setItems(data);
        } else if (data && typeof data === "object") {
          setItems([data]);
        } else {
          throw new Error(
            "Unexpected response format, expected an array or object"
          );
        }
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

  const closeViewModal = () => {
    setViewModalOpen(false);
    setCurrentItem(null);
    setBorrowedItems([]);
  };

  const filteredItems = Array.isArray(items)
    ? items.filter(
        (item) =>
          item.RequestedBy.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (statusQuery === "" || item.Status === statusQuery)
      )
    : [];

  if (loading) {
    return <div>Loading borrow requests...</div>;
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-grow p-6">
        <div className="bg-gray-200 p-4 shadow-lg rounded-lg mb-6 text-center">
          <h2 className="text-2xl font-bold">Borrow Overview</h2>
        </div>

        {/* Search Bar with Shadow */}
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

        {/* Borrow Request Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      </div>
    </div>
  );
}
