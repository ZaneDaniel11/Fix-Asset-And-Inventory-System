import React, { useState, useEffect } from "react";
import "../CSS/print.css";
import { toast } from "react-toastify";
import emailjs from "emailjs-com";

export default function RequestItems() {
  const [viewRequestModalOpen, setViewRequestModalOpen] = useState(false);
  const [editModal, setEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [items, setItems] = useState([]);
  const [adminApproval, setAdminApproval] = useState("");
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const handleBeforePrint = () => {
    setIsPrinting(true);
  };
  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false);
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const handlePrint = () => {
    const printContent = document.getElementById("printContent");
    const printWindow = window.open("", "_blank");
    const style = `
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
        }
        .details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .approval-status .admin-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .approval-status .admin-row div {
          text-align: center;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
        .no-print {
          display: none;
        }
        .text-gray-600 {
          color: #6b7280;
        }
        .text-gray-800 {
          color: #374151;
        }
        .font-semibold {
          font-weight: 600;
        }
        .rounded-lg {
          border-radius: 0.5rem;
        }
        .text-xl {
          font-size: 1.25rem;
        }
      </style>
    `;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Request Details</title>
          ${style}
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
  const openViewRequestModal = (item) => {
    setCurrentItem(item);
    setViewRequestModalOpen(true);
  };

  const storedUsername = localStorage.getItem("userType");

  const closeDeclineModal = () => {
    setDeclineModalOpen(false);
    setDeclineReason("");
  };

  // Fetch API data
  useEffect(() => {
    fetch("https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/RequestItemsApi/GetAllRequests")
      .then((response) => response.json())
      .then((data) => {
        const mappedItems = data.map((item) => ({
          id: item.requestID,
          name: item.requestedItem,
          requestedBy: item.requestedBy,
          requestedDate: new Date(item.requestedDate).toLocaleString(),
          status: item.status,
          priority: item.priority,
          Admin1: item.admin1Approval,
          Admin2: item.admin2Approval,
          Admin3: item.admin3Approval,
          cost: item.estimatedCost,
          description: item.description,
          suggestedDealer: item.suggestedDealer,
          email: item.email,
        }));
        setItems(mappedItems);

        console.log(mappedItems);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const openEditModal = (item) => {
    setCurrentItem(item);
    setAdminApproval(item.Admin2);
    setEditModalOpen(true);
  };
  const closeEditModal = () => setEditModalOpen(false);

  const openViewModal = (item) => {
    setCurrentItem(item);
    setViewModalOpen(true);
  };

  // Filter items by search query, status, and Admin1 approval
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusQuery === "" || item.status === statusQuery) &&
      item.Admin2 === "Approved" &&
      item.status === "In Progress"
  );

  const handleUpdate = async () => {
    if (adminApproval === "Declined" && !declineReason) {
      setDeclineModalOpen(true); // Open decline reason modal if no reason is provided
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(
        `https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/RequestItemsApi/UpdateAdmin3Approval/${currentItem.id}`,
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

      // Prepare email parameters
      const emailParams = {
        user_name: currentItem.requestedBy || "User",
        user_email: currentItem.email,
        request_status: adminApproval || "Pending",
        from_name: storedUsername || "System Admin",
      };

      // Choose email template based on approval status
      const templateId =
        adminApproval === "Declined"
          ? "template_c5uw6be" // Template for declined requests
          : "template_7sxyqel"; // Template for approved requests

      if (adminApproval === "Declined") {
        emailParams.declined_reason = declineReason; // Add decline reason for declined requests
      }

      // Send email
      emailjs
        .send("service_c14cdbr", templateId, emailParams, "AizAF8z_EWHeTDYJi")
        .then(
          () => {
            console.log("Email sent successfully!");
          },
          (error) => {
            console.error("Failed to send email:", error);
          }
        );

      toast.success(`Request updated successfully!`);
      closeUpdateModal();
      closeDeclineModal();
      setDeclineReason("");

      // Show success notification
    } catch (error) {
      console.error("Error updating approval:", error.message);
      setError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to close the update modal
  const closeUpdateModal = () => {
    setEditModalOpen(false);
    setCurrentItem(null);
  };

  // Function to close the decline modal

  return (
    <>
      <div className="limiter w-full">
        <div className="container mx-auto p-6">
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-700">
              Request Overview
            </h2>
          </div>
          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search by Item Name"
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
                    Request ID
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Item Name
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Requested By
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Requested Date
                  </th>
                  <th className="border border-gray-300 px-5 py-3">Status</th>
                  <th className="border border-gray-300 px-5 py-3">Priority</th>
                  <th className="border border-gray-300 px-5 py-3">
                    Inventory Admin
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Head Admin
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    School Admin
                  </th>
                  <th className="border border-gray-300 px-5 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-5 py-3">
                      {item.id}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {item.name}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {item.requestedBy}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {item.requestedDate}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.status === "Pending"
                          ? "text-yellow-600"
                          : item.status === "Rejected"
                          ? "text-red-600"
                          : item.status === "In Progress"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      <i
                        className={`fa mr-1 ${
                          item.status === "Approved"
                            ? "fa-check-circle"
                            : item.status === "Rejected"
                            ? "fa-times-circle"
                            : "fa-hourglass-half"
                        }`}
                      ></i>
                      {item.status}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.priority === "High"
                          ? "text-red-600"
                          : item.priority === "Medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {item.priority}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.Admin1 === "Pending"
                          ? "text-yellow-600"
                          : item.Admin1 === "Rejected"
                          ? "text-red-600"
                          : item.Admin1 === "In Progress"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      <i
                        className={`fa mr-1 ${
                          item.Admin1 === "Approved"
                            ? "fa-check-circle"
                            : item.Admin1 === "Rejected"
                            ? "fa-times-circle"
                            : "fa-hourglass-half"
                        }`}
                      ></i>
                      {item.Admin1}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.Admin2 === "Pending"
                          ? "text-yellow-600"
                          : item.Admin2 === "Rejected"
                          ? "text-red-600"
                          : item.Admin2 === "In Progress"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      <i
                        className={`fa mr-1 ${
                          item.Admin2 === "Approved"
                            ? "fa-check-circle"
                            : item.Admin2 === "Rejected"
                            ? "fa-times-circle"
                            : "fa-hourglass-half"
                        }`}
                      ></i>
                      {item.Admin2}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 font-medium ${
                        item.Admin3 === "Pending"
                          ? "text-yellow-600"
                          : item.Admin3 === "Rejected"
                          ? "text-red-600"
                          : item.Admin3 === "In Progress"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      <i
                        className={`fa mr-1 ${
                          item.Admin3 === "Approved"
                            ? "fa-check-circle"
                            : item.Admin3 === "Rejected"
                            ? "fa-times-circle"
                            : "fa-hourglass-half"
                        }`}
                      ></i>
                      {item.Admin3}
                    </td>
                    <td className="border border-gray-300 px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openViewRequestModal(item)}
                          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          <i className="fa-solid fa-pen"></i>
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

      {/* Edit Modal */}

      {viewRequestModalOpen && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            id="printContent" // Content to print
            className="bg-white p-8 rounded-lg max-w-3xl w-full mx-4 md:mx-0 shadow-lg"
          >
            {/* Print Styles */}

            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h5 className="text-3xl font-bold text-gray-800 flex items-center">
                <i className="fa-solid fa-eye mr-3 text-blue-500"></i>
                Request Details
              </h5>
              <button
                type="button"
                onClick={() => setViewRequestModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 no-print"
              >
                <i className="fa-solid fa-xmark text-3xl"></i>
              </button>
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8 border rounded-lg p-4 bg-gray-50 details">
              <div>
                <p className="text-lg font-semibold text-gray-600 flex items-center">
                  <i className="fa-solid fa-money-bill mr-2 text-green-500"></i>
                  Estimated Cost
                </p>
                <p className="text-xl text-gray-800">{currentItem.cost}</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600 flex items-center">
                  <i className="fa-solid fa-box mr-2 text-blue-500"></i>
                  Item Name
                </p>
                <p className="text-xl text-gray-800">{currentItem.name}</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600 flex items-center">
                  <i className="fa-solid fa-user-tag mr-2 text-yellow-500"></i>
                  Suggested Dealer
                </p>
                <p className="text-xl text-gray-800">
                  {currentItem.suggestedDealer}
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600 flex items-center">
                  <i className="fa-solid fa-file-alt mr-2 text-gray-500"></i>
                  Item Description
                </p>
                <p className="text-xl text-gray-800">
                  {currentItem.description}
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600 flex items-center">
                  <i className="fa-solid fa-user mr-2 text-purple-500"></i>
                  Requested By
                </p>
                <p className="text-xl text-gray-800">
                  {currentItem.requestedBy}
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600 flex items-center">
                  <i className="fa-solid fa-calendar-alt mr-2 text-red-500"></i>
                  Requested Date
                </p>
                <p className="text-xl text-gray-800">
                  {new Date(currentItem.requestedDate).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600 flex items-center">
                  <i className="fa-solid fa-exclamation-circle mr-2 text-orange-500"></i>
                  Priority
                </p>
                <p
                  className={`text-xl font-semibold ${
                    currentItem.priority === "High"
                      ? "text-red-600"
                      : currentItem.priority === "Medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {currentItem.priority}
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600 flex items-center">
                  <i className="fa-solid fa-tasks mr-2 text-teal-500"></i>
                  Status
                </p>
                <p
                  className={`text-xl font-semibold ${
                    currentItem.status === "Approved"
                      ? "text-green-600"
                      : currentItem.status === "In Progress"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  <i
                    className={`mr-2 ${
                      currentItem.status === "Approved"
                        ? "fa-solid fa-check-circle"
                        : currentItem.status === "In Progress"
                        ? "fa-solid fa-spinner fa-spin"
                        : "fa-solid fa-times-circle"
                    }`}
                  ></i>
                  {currentItem.status}
                </p>
              </div>
            </div>

            {/* Approval Status */}
            <div class="approval-status">
              <h6 className="text-lg font-bold text-gray-600 mb-4">
                Approval Status
              </h6>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 admin-row">
                <div className="flex flex-col items-center bg-gray-50 p-5 rounded-lg shadow-md">
                  <i
                    className={`text-3xl mb-3 ${
                      currentItem.Admin1 === "Approved"
                        ? "fa-solid fa-check-circle text-green-600"
                        : currentItem.Admin1 === "Rejected"
                        ? "fa-solid fa-times-circle text-red-600"
                        : "fa-solid fa-hourglass-half text-yellow-600"
                    }`}
                  ></i>
                  <p className="text-lg text-gray-700 font-medium">
                    Inventory Admin
                  </p>
                  <span
                    className={`text-xl font-semibold ${
                      currentItem.Admin1 === "Approved"
                        ? "text-green-600"
                        : currentItem.Admin1 === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {currentItem.Admin1}
                  </span>
                </div>
                {/* Admin 2 */}
                <div className="flex flex-col items-center bg-gray-50 p-5 rounded-lg shadow-md">
                  <i
                    className={`text-3xl mb-3 ${
                      currentItem.Admin2 === "Approved"
                        ? "fa-solid fa-check-circle text-green-600"
                        : currentItem.Admin2 === "Rejected"
                        ? "fa-solid fa-times-circle text-red-600"
                        : "fa-solid fa-hourglass-half text-yellow-600"
                    }`}
                  ></i>
                  <p className="text-lg text-gray-700 font-medium">
                    Head Admin
                  </p>
                  <span
                    className={`text-xl font-semibold ${
                      currentItem.Admin2 === "Approved"
                        ? "text-green-600"
                        : currentItem.Admin2 === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {currentItem.Admin2}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center bg-gray-50 p-5 rounded-lg shadow-md mt-6">
                <p className="text-lg text-gray-700 font-medium">President</p>
                <span className="text-xl font-semibold text-gray-800">
                  Victor Elliot S. Lepiten
                </span>
              </div>
            </div>

            {/* Print and Close Buttons */}
            {!isPrinting && (
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-green-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-600 text-lg no-print"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setViewRequestModalOpen(false)}
                  className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600 text-lgtext-gray-500 hover:text-gray-700 no-print"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {editModal && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={closeEditModal}
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
