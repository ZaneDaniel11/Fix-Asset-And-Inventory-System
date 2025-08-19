import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import emailjs from "emailjs-com";
export default function BorrowedItems() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
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

  const storedUsername = localStorage.getItem("userType");

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
        `https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/ViewRequest/${borrowId}`
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
        `https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/UpdateApproval/${currentItem.BorrowId}`,
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

      const emailParams = {
        user_name: currentItem.RequestedBy || "User", // User's name
        user_email: currentItem.Email, // User's email
        request_status: adminApproval || "Pending", // Approval status
        from_name: storedUsername || "System Admin", // Sender's name
        // decline_reason:
        //   adminApproval === "Declined" ? `Reason: ${declineReason}` : "",
      };

      // Send email notification
      emailjs
        .send(
          "service_c14cdbr", // Replace with your Email.js service ID
          "template_7sxyqel", // Replace with your Email.js template ID
          emailParams,
          "AizAF8z_EWHeTDYJi" // Replace with your Email.js public key
        )
        .then(
          () => {
            console.log("Email sent successfully!");
          },
          (error) => {
            console.error("Failed to send email:", error);
          }
        );

      closeUpdateModal();
      closeDeclineModal();
      setDeclineReason("");
      console.log(emailParams);
      toast.success(`Request Updated successfully!`); // Reset decline reason after submission
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
            <h2 className="text-3xl font-bold text-gray-700">
              Borrow Request List
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
                  <th className="border border-gray-300 px-5 py-3">Priority</th>
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
                    <td
                      className={`border border-gray-300 px-5 py-3 ${
                        item.Priority === "High"
                          ? "text-red-600 font-bold"
                          : item.Priority === "Medium"
                          ? "text-yellow-600 font-medium"
                          : item.Priority === "Low"
                          ? "text-green-600 font-light"
                          : "text-gray-600 "
                      }`}
                    >
                      {item.Priority}
                    </td>

                    <td
                      className={`border border-gray-300 px-5 py-3 ${
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
                    <td
                      className={`border border-gray-300 px-5 py-3  ${
                        item.Admin1Approval === "Pending"
                          ? "text-yellow-600"
                          : item.Admin1Approval === "Rejected"
                          ? "text-red-600"
                          : item.Admin1Approval === "Approved"
                          ? "text-green-500"
                          : "text-green-600"
                      }`}
                    >
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
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-3/4 max-w-5xl p-8 overflow-auto">
      {/* Modal Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <i className="fa-solid fa-box-archive text-blue-600"></i> Borrow Item
          Details
        </h3>
        <button
          onClick={closeViewModal}
          className="text-gray-500 hover:text-gray-700 transition duration-200"
        >
          <i className="fa-solid fa-times text-2xl"></i>
        </button>
      </div>

      {/* Borrow Details */}
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

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-user-check text-green-500"></i>
          <span>
            <strong>Inventory Admin:</strong>{" "}
            <span
              className={
                currentItem.Admin1Approval === "Approved"
                  ? "text-green-500"
                  : currentItem.Admin1Approval === "Pending"
                  ? "text-yellow-500"
                  : "text-red-500"
              }
            >
              {currentItem.Admin1Approval}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-user-check text-green-500"></i>
          <span>
            <strong>Head Admin:</strong>{" "}
            <span
              className={
                currentItem.Admin2Approval === "Approved"
                  ? "text-green-500"
                  : currentItem.Admin2Approval === "Pending"
                  ? "text-yellow-500"
                  : "text-red-500"
              }
            >
              {currentItem.Admin2Approval}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-user-check text-green-500"></i>
          <span>
            <strong>School Admin:</strong>{" "}
            <span
              className={
                currentItem.Admin3Approval === "Approved"
                  ? "text-green-500"
                  : currentItem.Admin3Approval === "Pending"
                  ? "text-yellow-500"
                  : "text-red-500"
              }
            >
              {currentItem.Admin3Approval}
            </span>
          </span>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      {/* Borrowed Items Section */}
      <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <i className="fa-solid fa-boxes-stacked text-green-600"></i> Borrowed
        Items
      </h4>
      <div className="overflow-y-auto max-h-[300px] space-y-4">
        <ul>
          {borrowLoading ? (
            <div className="text-center text-gray-500 text-lg">
              Loading borrowed items...
            </div>
          ) : borrowedItems.length === 0 ? (
            <div className="text-center text-gray-500 text-lg">
              No borrowed items found
            </div>
          ) : (
            borrowedItems.map((item) => (
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
            ))
          )}
        </ul>
      </div>

      {/* Modal Footer */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={closeViewModal}
          className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-200 flex items-center gap-2"
        >
          <i className="fa-solid fa-circle-xmark"></i> Close
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
