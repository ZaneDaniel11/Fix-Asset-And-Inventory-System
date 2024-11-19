import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";

export default function BorrowStatus() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

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
    ? items.filter((item) => statusQuery === "" || item.Status === statusQuery)
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
            <select
              value={statusQuery}
              onChange={(e) => setStatusQuery(e.target.value)}
              className="p-2 border rounded border-gray-400"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Rejected">Rejected</option>
              <option value="Declined">Declined</option>
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
      </div>
    </div>
  );
}
