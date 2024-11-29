import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function SupperBorrow() {
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
  const [declineReason, setDeclineReason] = useState("");
  const storedUsername = localStorage.getItem("userType");
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  // Fetch only approved borrow requests and remove duplicates
  useEffect(() => {
    const fetchApprovedBorrowRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:5075/api/BorrowRequestApi/ApprovedByBothAdmins"
        );
        const data = await response.json();

        // Remove duplicates based on BorrowId
        const uniqueItems = data.reduce((acc, current) => {
          const x = acc.find((item) => item.BorrowId === current.BorrowId);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);

        setItems(uniqueItems);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedBorrowRequests();
  }, []);

  // Handle the Admin3 approval update
  const handleUpdate = async () => {
    if (adminApproval === "Declined" && !declineReason) {
      setDeclineModalOpen(true); // Open decline reason modal if no reason is provided
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(
        `http://localhost:5075/api/BorrowRequestApi/UpdateApprovalAdmin3/${currentItem.BorrowId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admin3Approval: adminApproval,
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
      setDeclineReason("");
      toast.success(`Request Updated successfully!`); // Reset decline reason after submission
    } catch (error) {
      console.error("Error updating approval:", error.message);
      setError(error.message);
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

  const closeDeclineModal = () => {
    setDeclineModalOpen(false);
    setDeclineReason("");
  };
  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setCurrentItem(null);
    setDeclineReason("");
  };
  const filteredItems = items.filter(
    (item) =>
      item.Admin3Approval === "Pending" && // Ensure Admin3Approval is pending
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
      <div className="limiter w-full">
        <div className="container mx-auto p-6">
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-700">
              Borrow Overview
            </h2>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex justify-between items-center">
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
                  <th className="border border-gray-300 px-5 py-3">
                    Inventory Admin
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Head Admin
                  </th>
                  <th className="border border-gray-300 px-5 py-3">Approval</th>
                  <th className="border border-gray-300 px-5 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.BorrowId} className="hover:bg-gray-50">
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
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.Status === "Pending"
                          ? "text-yellow-600"
                          : item.Status === "Rejected"
                          ? "text-red-600"
                          : item.Status === "In Progress"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      <i
                        className={`fa mr-1 ${
                          item.Status === "Approved"
                            ? "fa-check-circle"
                            : item.Status === "Rejected"
                            ? "fa-times-circle"
                            : "fa-hourglass-half"
                        }`}
                      ></i>
                      {item.Status}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.Admin1Approval === "Pending"
                          ? "text-yellow-600"
                          : item.Admin1Approval === "Rejected"
                          ? "text-red-600"
                          : item.Admin1Approval === "In Progress"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      <i
                        className={`fa mr-1 ${
                          item.Admin1Approval === "Approved"
                            ? "fa-check-circle"
                            : item.Admin1Approval === "Rejected"
                            ? "fa-times-circle"
                            : "fa-hourglass-half"
                        }`}
                      ></i>
                      {item.Admin1Approval}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.Admin2Approval === "Pending"
                          ? "text-yellow-600"
                          : item.Admin2Approval === "Rejected"
                          ? "text-red-600"
                          : item.Admin2Approval === "In Progress"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      <i
                        className={`fa mr-1 ${
                          item.Admin2Approval === "Approved"
                            ? "fa-check-circle"
                            : item.Admin2Approval === "Rejected"
                            ? "fa-times-circle"
                            : "fa-hourglass-half"
                        }`}
                      ></i>
                      {item.Admin2Approval}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.Admin3Approval === "Pending"
                          ? "text-yellow-600"
                          : item.Admin3Approval === "Rejected"
                          ? "text-red-600"
                          : item.Admin3Approval === "In Progress"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      <i
                        className={`fa mr-1 ${
                          item.Admin3Approval === "Approved"
                            ? "fa-check-circle"
                            : item.Admin3Approval === "Rejected"
                            ? "fa-times-circle"
                            : "fa-hourglass-half"
                        }`}
                      ></i>
                      {item.Admin3Approval}
                    </td>
                    <td className="border border-gray-300 px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openViewModal(item)}
                          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openUpdateModal(item)}
                          className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          Update
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
          <div
            id="printContent" // Content to print
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 relative"
          >
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

              {/* Approval Status Section */}
              <div className="mt-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">
                  Approval Status
                </h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <i
                      className={`fa-solid fa-circle-check ${
                        currentItem.Admin1Approval === "Approved"
                          ? "text-green-600"
                          : currentItem.Admin1Approval === "Rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    ></i>
                    <span>
                      <strong>Inventory Admin:</strong>{" "}
                      <span
                        className={`${
                          currentItem.Admin1Approval === "Approved"
                            ? "text-green-600"
                            : currentItem.Admin1Approval === "Rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {currentItem.Admin1Approval}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <i
                      className={`fa-solid fa-circle-check ${
                        currentItem.Admin2Approval === "Approved"
                          ? "text-green-600"
                          : currentItem.Admin2Approval === "Rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    ></i>
                    <span>
                      <strong>Head Admin:</strong>{" "}
                      <span
                        className={`${
                          currentItem.Admin2Approval === "Approved"
                            ? "text-green-600"
                            : currentItem.Admin2Approval === "Rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {currentItem.Admin2Approval}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center bg-gray-50 p-5 rounded-lg shadow-md mt-6">
                <p className="text-lg text-gray-700 font-medium">President</p>
                <span className="text-xl font-semibold text-gray-800">
                  Victor Elliot S. Lepiten
                </span>
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
                      <img
                        src="https://via.placeholder.com/100"
                        alt={item.ItemName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
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

            {/* Print Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => {
                  const printContent = document.getElementById("printContent");
                  const printWindow = window.open("", "_blank");
                  printWindow.document.write(`
      <html>
      <head>
        <title>Print Borrow Request Details</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1, h2, h3, h4 {
            color: #4A5568;
          }
          .section-title {
            margin-top: 20px;
            font-size: 18px;
            font-weight: bold;
            color: #2D3748;
            border-bottom: 2px solid #CBD5E0;
            padding-bottom: 5px;
          }
          .details {
            margin-top: 10px;
            line-height: 1.6;
          }
          .details div {
            margin-bottom: 10px;
          }
          .approval-status, .borrowed-items {
            margin-top: 20px;
          }
          .borrowed-items ul {
            columns: 2; /* Two-column layout */
            list-style-type: none;
            padding: 0;
          }
          .borrowed-items li {
            margin-bottom: 5px;
          }
          .print-footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: #718096;
          }
        </style>
      </head>
      <body>
        <h1>Borrow Request Details</h1>
        <div class="details">
          <div><strong>ID:</strong> ${currentItem.BorrowId}</div>
          <div><strong>Requested By:</strong> ${currentItem.RequestedBy}</div>
          <div><strong>Request Date:</strong> ${currentItem.ReqBorrowDate}</div>
          <div><strong>Purpose:</strong> ${currentItem.Purpose}</div>
          <div><strong>Status:</strong> ${currentItem.Status}</div>
        </div>
        <div class="approval-status">
          <h2 class="section-title">Approval Status</h2>
          <div><strong>Inventory Admin:</strong> ${
            currentItem.Admin1Approval
          }</div>
          <div><strong>Head Admin:</strong> ${currentItem.Admin2Approval}</div>
        </div>
        <div class="borrowed-items">
          <h2 class="section-title">Borrowed Items</h2>
          <ul>
            ${borrowedItems
              .map(
                (item) =>
                  `<li>${item.ItemName}, Quantity: ${item.Quantity}x</li>`
              )
              .join("")}
          </ul>
        </div>
        <div class="print-footer">
          Printed on ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `);
                  printWindow.document.close();
                  printWindow.print();
                }}
                className="bg-green-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-600 text-lg"
              >
                Print
              </button>
            </div>
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
      {/* Reject Reason Modal */}
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
