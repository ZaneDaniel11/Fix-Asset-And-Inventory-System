import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import { toast } from "react-toastify";

export default function BorrowStatus() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [statusQuery, setStatusQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

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
        setItems(Array.isArray(data) ? data : [data]);
        console.log(data);
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

  const openCancelModal = (item) => {
    setCurrentItem(item);
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setCurrentItem(null);
  };

  const cancelRequest = async () => {
    if (!currentItem) return;

    setCanceling(true);
    try {
      const response = await fetch(
        "http://localhost:5075/api/BorrowRequestApi/CancelRequest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ borrowId: currentItem.BorrowId }),
        }
      );
      toast.error("Borrow Canceled");
      if (!response.ok) {
        throw new Error("Failed to cancel the request");
      }

      // Update the UI to reflect the cancellation
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.BorrowId === currentItem.BorrowId
            ? { ...item, Status: "Canceled" }
            : item
        )
      );

      closeCancelModal();
    } catch (error) {
      setError(error.message);
    } finally {
      setCanceling(false);
    }
  };

  const filteredItems = Array.isArray(items)
    ? items.filter(
        (item) => item.Status === "Pending" || item.Status === "In Progress"
      )
    : [];

  if (loading) {
    return <div>Loading borrow requests...</div>;
  }

  return (
    <>
      {/* Main Content */}
      <div className="flex-grow p-6">
        <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-700">Borrow Overview</h2>
        </div>

        {/* Search Bar */}
        <div className="p-4 mb-4 bg-white shadow-md rounded-md"></div>

        {/* Borrow Request Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-200">
              <tr className="text-zinc-50">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Borrow ID
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Requested By
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Date
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Purpose
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Status
                </th>

                <th className="border border-gray-300 px-4 py-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr
                  key={item.BorrowId}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition duration-200`}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {item.BorrowId}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.RequestedBy}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.ReqBorrowDate}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.Purpose}
                  </td>
                  <td
                    className={`border border-gray-300 px-4 py-2 font-medium ${
                      item.Status === "Pending"
                        ? "text-yellow-600"
                        : item.Status === "Canceled"
                        ? "text-red-600"
                        : item.Status === "In Progress"
                        ? "text-blue-600"
                        : item.Status === "Rejected"
                        ? "text-red-600"
                        : item.Status === "Approved"
                        ? "text-green-500"
                        : "text-green-600"
                    }`}
                  >
                    {item.Status}
                  </td>

                  <td className="border border-gray-300 px-4 py-2 text-center flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => openViewModal(item)}
                      className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    {item.Status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => openCancelModal(item)}
                        className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-1.5"
                      >
                        <i className="fa-solid fa-ban"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cancel Modal */}
        {cancelModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md mx-auto p-6 rounded-lg shadow-lg relative">
              <h3 className="text-lg font-bold text-gray-800 text-center mb-4">
                Confirm Cancellation
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to cancel this request? This action cannot
                be undone.
              </p>

              <div className="flex justify-between items-center space-x-4">
                <button
                  onClick={closeCancelModal}
                  className="w-full py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                >
                  No, Go Back
                </button>
                <button
                  onClick={cancelRequest}
                  disabled={canceling}
                  className="w-full py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  {canceling ? "Canceling..." : "Yes, Cancel"}
                </button>
              </div>

              {/* Close Icon */}
              <button
                onClick={closeCancelModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        )}

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
                Borrow Request Details
              </h2>

              {/* Borrow Request Details */}
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
                </div>
              </div>

              <hr className="my-6 border-gray-300" />

              {/* Borrowed Items Section */}
              <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-boxes-stacked text-green-600"></i>{" "}
                Borrowed Items
              </h4>

              {borrowLoading ? (
                <div className="text-center text-gray-500 text-lg">
                  Loading borrowed items...
                </div>
              ) : borrowedItems.length === 0 ? (
                <div className="text-center text-gray-500 text-lg">
                  No borrowed items found
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[300px] space-y-4">
                  <ul>
                    {borrowedItems.map((item) => (
                      <div
                        key={item.ItemId}
                        className="flex items-center gap-6 border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-lg transition-shadow duration-300 mb-3"
                      >
                        {/* Image Section */}
                        <img
                          src="https://via.placeholder.com/100"
                          alt={item.ItemName}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        {/* Content Section */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {item.ItemName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Quantity: <strong>{item.Quantity}</strong>
                          </p>
                        </div>
                      </div>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
