import Sidebar from "../components/sidebar";
import React, { useState, useEffect } from "react";

export default function Admin1Logs() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [requestItems, setRequestItems] = useState([]); // State for request items
  const [borrowRequests, setBorrowRequests] = useState([]); // State for borrow requests
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState("requestItems"); // State to track which table to show

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

  // Fetch request items for "Request Items" button
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
          }));
          setRequestItems(mappedItems); // Set request items data
        })
        .catch((error) => console.error("Error fetching data:", error));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch borrow requests for "Borrow Request" button
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
          }));
          setBorrowRequests(mappedItems); // Set borrow requests data
        })
        .catch((error) => console.error("Error fetching data:", error));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to open view modal and display details
  const openViewModal = async (item) => {
    setCurrentItem(item); // Set current item for viewing
    setViewModalOpen(true); // Open view modal

    // If it's a borrow request, fetch additional items
    if (selectedTable === "borrowRequests") {
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
    }
  };

  // Function to handle button clicks to show tables
  const handleTableChange = (table) => {
    setSelectedTable(table);
    if (table === "requestItems") {
      fetchRequestItems(); // Fetch request items when "Request Item" button is clicked
    } else if (table === "borrowRequests") {
      fetchBorrowRequests(); // Fetch borrow requests when "Borrow Request" button is clicked
    }
  };

  // Filtered request items for Admin1-approved and declined requests
  const filteredItems = requestItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (item.Admin2 === "Approved" || item.Admin2 === "Declined") && // Only show approved or declined
      item.Admin1 === "Approved" // Ensure it's approved by Admin1
  );

  if (loading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="flex">
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="container mx-auto bg-white shadow-md rounded-lg p-6">
            <div className="bg-gray-200 p-4 shadow-lg rounded-lg mb-6 text-center">
              <h2 className="text-2xl font-bold"> Overview</h2>
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

            {/* Buttons to switch between tables */}
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

            {/* Conditionally render the correct table based on selectedTable state */}
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
                      <th className="column7">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id}>
                        <td className="column1">{item.id}</td>
                        <td className="column2">{item.name}</td>
                        <td className="column3">{item.requestedBy}</td>
                        <td className="column4">{item.requestedDate}</td>
                        <td className="column5">{item.status}</td>
                        <td className="column6">{item.priority}</td>
                        <td className="column6">{item.Admin1}</td>
                        <td className="column6">{item.Admin2}</td>
                        <td className="column7">
                          <button onClick={() => openViewModal(item)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
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
                      <th className="column3">Requested Date</th>
                      <th className="column4">Purpose</th>
                      <th className="column5">Status</th>
                      <th className="column6">Admin1 Approval</th>
                      <th className="column6">Admin2 Approval</th>
                      <th className="column7">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowRequests.map((item) => (
                      <tr key={item.BorrowId}>
                        <td className="column1">{item.BorrowId}</td>
                        <td className="column2">{item.RequestedBy}</td>
                        <td className="column3">{item.ReqBorrowDate}</td>
                        <td className="column4">{item.Purpose}</td>
                        <td className="column5">{item.Status}</td>
                        <td className="column6">{item.Admin1Approval}</td>
                        <td className="column6">{item.Admin2Approval}</td>
                        <td className="column7">
                          <button onClick={() => openViewModal(item)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">
              Viewing Borrowed Items for Borrow ID: {currentItem.BorrowId}
            </h2>
            <ul>
              {borrowedItems.map((item) => (
                <li key={item.id}>
                  {item.ItemName} - {item.Quantity}
                </li>
              ))}
            </ul>
            {borrowLoading && <p>Loading borrowed items...</p>}
            <button
              onClick={() => setViewModalOpen(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
