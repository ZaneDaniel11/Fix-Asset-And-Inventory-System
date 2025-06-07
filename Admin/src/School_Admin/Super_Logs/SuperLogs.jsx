import React, { useState, useEffect } from "react";
import "../CSS/print.css";

export default function Logs() {
  const [viewRequestModalOpen, setViewRequestModalOpen] = useState(false);
  const [viewBorrowModalOpen, setViewBorrowModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [requestItems, setRequestItems] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState("requestItems");
  const [isPrinting, setIsPrinting] = useState(false);
  const handleBeforePrint = () => {
    setIsPrinting(true); // Hide buttons before printing
  };
  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false); // Show buttons after printing
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

  // Fetch approved borrow requests (initial load)
  useEffect(() => {
    const fetchApprovedBorrowRequests = async () => {
      try {
        const response = await fetch(
          "https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/ApprovedByAdmin1"
        );
        const data = await response.json();
        setBorrowRequests(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedBorrowRequests();
  }, []);

  const fetchRequestItems = async () => {
    try {
      setLoading(true);
      fetch("https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/RequestItemsApi/GetAllRequests")
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
          }));
          setRequestItems(mappedItems);
          console.log(mappedItems);
        })
        .catch((error) => console.error("Error fetching data:", error));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowRequests = async () => {
    try {
      setLoading(true);
      fetch("https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/AllRequests")
        .then((response) => response.json())
        .then((data) => {
          const mappedItems = data.map((item) => ({
            BorrowId: item.BorrowId,
            RequestedBy: item.RequestedBy,
            ReqBorrowDate: new Date(item.ReqBorrowDate).toLocaleString(),
            Purpose: item.Purpose,
            Status: item.Status,
            Admin1Approval: item.Admin1Approval,
            Admin2Approval: item.Admin2Approval,
            Admin3Approval: item.Admin3Approval,
          }));
          setBorrowRequests(mappedItems);
        })
        .catch((error) => console.error("Error fetching data:", error));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openViewRequestModal = (item) => {
    setCurrentItem(item);
    setViewRequestModalOpen(true);
  };

  const openViewBorrowModal = async (item) => {
    setCurrentItem(item);
    setViewBorrowModalOpen(true);
    setBorrowLoading(true);

    try {
      const response = await fetch(
        `https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/ViewRequest/${item.BorrowId}`
      );
      const data = await response.json();
      setBorrowedItems(data);
    } catch (error) {
      console.error("Error fetching borrowed items:", error);
    } finally {
      setBorrowLoading(false);
    }
  };

  const handleTableChange = (table) => {
    setSelectedTable(table);
    if (table === "requestItems") {
      fetchRequestItems();
    } else if (table === "borrowRequests") {
      fetchBorrowRequests();
    }
  };

  const filteredItems = requestItems.filter(
    (item) =>
      item.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (item.Admin3 === "Approved" || item.Admin3 === "Declined") &&
      item.Admin2 === "Approved"
  );

  const filteredItems1 = borrowRequests.filter(
    (item) =>
      item.RequestedBy.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (item.Admin3Approval === "Approved" ||
        item.Admin3Approval === "Declined") &&
      item.Admin2Approval === "Approved"
  );
  if (loading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="flex-1 p-6">
        <div className="container mx-auto bg-white shadow-md rounded-lg p-6">
          <div className="bg-gray-200 p-4 shadow-lg rounded-lg mb-6 text-center">
            <h2 className="text-2xl font-bold">Overview</h2>
          </div>

          <div className="flex justify-between mb-4 shadow-lg p-6 bg-white rounded-lg mb-6">
            <input
              type="text"
              placeholder="Search by Requester Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-3 border rounded-lg shadow-sm border-gray-300"
            />
          </div>

          <div>
            <button
              onClick={() => handleTableChange("requestItems")}
              className={`px-4 py-2 font-bold ${
                selectedTable === "requestItems"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              Request Item
            </button>

            <button
              onClick={() => handleTableChange("borrowRequests")}
              className={`px-4 py-2 font-bold ${
                selectedTable === "borrowRequests"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              } ml-4`}
            >
              Borrow Request
            </button>
          </div>

          {selectedTable === "requestItems" ? (
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
                    <th className="border border-gray-300 px-5 py-3">
                      Priority
                    </th>
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
                  {filteredItems.map((item) => {
                    return (
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
                              : item.Admin3 === "Declined"
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
                                : item.Admin3 === "Declined"
                                ? "fa-times-circle"
                                : "fa-hourglass-half"
                            }`}
                          ></i>
                          {item.Admin3}
                        </td>
                        <td className="border border-gray-300 px-5 py-3 text-center">
                          <button
                            onClick={() => openViewRequestModal(item)}
                            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                          >
                            <i className="fa-solid fa-eye"></i> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
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
                    <th className="border border-gray-300 px-5 py-3">
                      Borrow Date
                    </th>
                    <th className="border border-gray-300 px-5 py-3">
                      Purpose
                    </th>
                    <th className="border border-gray-300 px-5 py-3">Status</th>
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
                  {filteredItems1.map((item) => {
                    return (
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
                              : item.Admin3Approval === "Declined"
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
                                : item.Admin3Approval === "Declined"
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
                              onClick={() => openViewBorrowModal(item)}
                              className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                            >
                              <i className="fa-solid fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
                      {new Date(currentItem.requestedDate).toLocaleString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
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
                    {/* Admin 3 */}
                    <div className="flex flex-col items-center bg-gray-50 p-5 rounded-lg shadow-md">
                      <i
                        className={`text-3xl mb-3 ${
                          currentItem.Admin3 === "Approved"
                            ? "fa-solid fa-check-circle text-green-600"
                            : currentItem.Admin3 === "Rejected"
                            ? "fa-solid fa-times-circle text-red-600"
                            : "fa-solid fa-hourglass-half text-yellow-600"
                        }`}
                      ></i>
                      <p className="text-lg text-gray-700 font-medium">
                        School Admin
                      </p>
                      <span
                        className={`text-xl font-semibold ${
                          currentItem.Admin3 === "Approved"
                            ? "text-green-600"
                            : currentItem.Admin3 === "Rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {currentItem.Admin3}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50 p-5 rounded-lg shadow-md mt-6">
                    <p className="text-lg text-gray-700 font-medium">
                      President
                    </p>
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

          {viewBorrowModalOpen && currentItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div
                id="printContent"
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setViewBorrowModalOpen(false)}
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
                        <strong>Request Date:</strong>{" "}
                        {currentItem.ReqBorrowDate}
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
                  <div className="grid grid-cols-2 gap-4">
                    {borrowedItems.map((item) => (
                      <div
                        key={item.ItemId}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-lg transition-shadow duration-300"
                      >
                        <span className="text-gray-800 font-semibold">
                          {item.ItemName}, Quantity: {item.Quantity}x
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Print Button */}
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => {
                      const printContent =
                        document.getElementById("printContent");
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
                  .details {
                    margin-top: 10px;
                    line-height: 1.6;
                  }
                  .borrowed-items {
                    margin-top: 20px;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                  }
                  .borrowed-items div {
                    padding: 10px;
                    border: 1px solid #CBD5E0;
                    border-radius: 8px;
                    background-color: #F7FAFC;
                  }
                </style>
              </head>
              <body>
                ${printContent.innerHTML}
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
        </div>
      </div>
    </>
  );
}
