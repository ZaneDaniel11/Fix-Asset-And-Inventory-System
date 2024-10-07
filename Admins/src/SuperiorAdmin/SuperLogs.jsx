import Sidebar from "../components/sidebar";
import React, { useState, useEffect } from "react";

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

  // Fetch approved borrow requests (initial load)
  useEffect(() => {
    const fetchApprovedBorrowRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:5075/api/BorrowRequestApi/ApprovedByAdmin1"
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
      fetch("http://localhost:5075/api/RequestItemsApi/GetAllRequests")
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
          }));
          setRequestItems(mappedItems);
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
      fetch("http://localhost:5075/api/BorrowRequestApi/GetAllBorrowRequests")
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
        `http://localhost:5075/api/BorrowRequestApi/ViewRequest/${item.BorrowId}`
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
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (item.Admin3 === "Approved" || item.Admin3 === "Declined") &&
      item.Admin2 === "Approved"
  );

  if (loading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const getAdminApprovalInfo = (approval) => {
    switch (approval) {
      case "Approved":
        return { className: "text-green-500", icon: "fa-check-circle" };
      case "Pending":
        return { className: "text-yellow-500", icon: "fa-hourglass-half" };
      case "Declined":
        return { className: "text-red-500", icon: "fa-times-circle" };
      default:
        return { className: "", icon: null };
    }
  };
  const getStatusInfo = (status) => {
    switch (status) {
      case "Approved":
        return "text-green-500 font-semibold";
      case "Pending":
        return "text-yellow-500 font-semibold";
      case "Rejected":
        return "text-red-500 font-semibold";
      case "In Progress":
        return "text-orange-300 font-semibold";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="flex">
        <Sidebar />

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
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table>
                  <thead>
                    <tr className="table100-head">
                      <th className="column1">Request ID</th>
                      <th className="column2">Item Name</th>
                      <th className="column3">Requested By</th>
                      <th className="column4">Requested Date</th>
                      <th className="column5">Status</th>
                      <th className="column6">Priority</th>
                      <th className="column6">Admin1</th>
                      <th className="column6">Admin2</th>
                      <th className="column6">Admin3</th>
                      <th className="column7">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const admin1Info = getAdminApprovalInfo(item.Admin1);
                      const admin2Info = getAdminApprovalInfo(item.Admin2);
                      const admin3Info = getAdminApprovalInfo(item.Admin3); // FIXED LINE
                      const statusClass = getStatusInfo(item.status);

                      return (
                        <tr key={item.id}>
                          <td className="column1">{item.id}</td>
                          <td className="column2">{item.name}</td>
                          <td className="column3">{item.requestedBy}</td>
                          <td className="column4">{item.requestedDate}</td>
                          <td className={`column5 ${statusClass}`}>
                            {item.status}
                          </td>
                          <td className="column6">{item.priority}</td>
                          <td className={`column6 ${admin1Info.className}`}>
                            <i className={`fa ${admin1Info.icon} mr-1`}></i>{" "}
                            {item.Admin1}
                          </td>
                          <td className={`column6 ${admin2Info.className}`}>
                            <i className={`fa ${admin2Info.icon} mr-1`}></i>{" "}
                            {item.Admin2}
                          </td>
                          <td className={`column6 ${admin3Info.className}`}>
                            {" "}
                            {/* FIXED LINE */}
                            <i
                              className={`fa ${admin3Info.icon} mr-1`}
                            ></i>{" "}
                            {item.Admin3}
                          </td>
                          <td className="column7">
                            <button
                              onClick={() => openViewRequestModal(item)}
                              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table>
                  <thead>
                    <tr className="table100-head">
                      <th className="column1">Borrow ID</th>
                      <th className="column2">Requested By</th>
                      <th className="column3">Borrow Date</th>
                      <th className="column4">Purpose</th>
                      <th className="column5">Status</th>
                      <th className="column6">Admin1</th>
                      <th className="column6">Admin2</th>
                      <th className="column6">Admin3</th> {/* FIXED LINE */}
                      <th className="column7">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowRequests.map((item) => {
                      const admin1Info = getAdminApprovalInfo(
                        item.Admin1Approval
                      );
                      const admin2Info = getAdminApprovalInfo(
                        item.Admin2Approval
                      );
                      const admin3Info = getAdminApprovalInfo(
                        item.Admin3Approval
                      ); // FIXED LINE
                      const statusClass = getStatusInfo(item.Status);

                      return (
                        <tr key={item.BorrowId}>
                          <td className="column1">{item.BorrowId}</td>
                          <td className="column2">{item.RequestedBy}</td>
                          <td className="column3">{item.ReqBorrowDate}</td>
                          <td className="column4">{item.Purpose}</td>
                          <td className={`column5 ${statusClass}`}>
                            {item.Status}
                          </td>
                          <td className={`column6 ${admin1Info.className}`}>
                            <i className={`fa ${admin1Info.icon} mr-1`}></i>{" "}
                            {item.Admin1Approval}
                          </td>
                          <td className={`column6 ${admin2Info.className}`}>
                            <i className={`fa ${admin2Info.icon} mr-1`}></i>{" "}
                            {item.Admin2Approval}
                          </td>
                          <td className={`column6 ${admin3Info.className}`}>
                            {" "}
                            {/* FIXED LINE */}
                            <i
                              className={`fa ${admin3Info.icon} mr-1`}
                            ></i>{" "}
                            {item.Admin3Approval}
                          </td>
                          <td className="column7">
                            <button
                              onClick={() => openViewBorrowModal(item)}
                              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {viewRequestModalOpen && currentItem && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Request Details</h2>
                  <p>Request ID: {currentItem.id}</p>
                  <p>Item Name: {currentItem.name}</p>
                  <p>Requested By: {currentItem.requestedBy}</p>
                  <p>Requested Date: {currentItem.requestedDate}</p>
                  <p>Status: {currentItem.status}</p>
                  <p>Priority: {currentItem.priority}</p>
                  <button
                    onClick={() => setViewRequestModalOpen(false)}
                    className="close-modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {viewBorrowModalOpen && currentItem && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Borrow Request Details</h2>
                  <p>Borrow ID: {currentItem.BorrowId}</p>
                  <p>Requested By: {currentItem.RequestedBy}</p>
                  <p>Borrow Date: {currentItem.ReqBorrowDate}</p>
                  <p>Purpose: {currentItem.Purpose}</p>
                  <p>Status: {currentItem.Status}</p>

                  <h3>Borrowed Items</h3>
                  {borrowLoading ? (
                    <p>Loading...</p>
                  ) : borrowedItems.length > 0 ? ( // FIXED LINE
                    borrowedItems.map(
                      (
                        item // FIXED LINE
                      ) => (
                        <li key={item.id}>
                          {item.ItemName} - {item.Quantity}
                        </li>
                      )
                    )
                  ) : (
                    <p>No borrowed items available.</p> // FIXED LINE
                  )}

                  <button
                    onClick={() => setViewBorrowModalOpen(false)}
                    className="close-modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
