import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";

export default function RequestList() {
  const [requests, setRequests] = useState([]);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = "http://localhost:5075/api/BorrowRequestApi";

  // Function to group requests by BorrowId
  const groupRequestsByBorrowId = (data) => {
    const groupedRequests = data.reduce((acc, curr) => {
      const { BorrowId, ItemName, Quantity } = curr;

      if (!acc[BorrowId]) {
        // Initialize a new request entry with common details and an empty items array
        acc[BorrowId] = {
          ...curr,
          Items: [],
        };
      }

      // Push each item into the corresponding BorrowId group
      acc[BorrowId].Items.push({ ItemName, Quantity });

      return acc;
    }, {});

    // Return the grouped requests as an array
    return Object.values(groupedRequests);
  };

  const getRequests = async () => {
    try {
      const borrowerId = localStorage.getItem("userId");

      if (!borrowerId) {
        throw new Error("User ID not found in localStorage");
      }

      // Fetch requests by borrowerId
      const response = await fetch(
        `${API_URL}/RequestsByBorrowerId?borrowerId=${borrowerId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      const result = await response.json();
      const groupedRequests = groupRequestsByBorrowId(result);
      setRequests(groupedRequests); // Set grouped borrow requests
    } catch (error) {
      console.error("Error fetching requests", error);
    }
  };

  const viewRequest = (request) => {
    setSelectedRequestDetails(request.Items); // Set the items of the selected request
    setIsModalOpen(true); // Open modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequestDetails([]); // Clear request details
  };

  useEffect(() => {
    getRequests();
  }, []);

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-5">My Borrow Requests</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="text-white">
            <tr>
              <th className="py-2 px-4">Borrow ID</th>
              <th className="py-2 px-4">Requested By</th>
              <th className="py-2 px-4">Purpose</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.BorrowId} className="hover:bg-gray-100">
                <td className="py-2 px-4">{request.BorrowId}</td>
                <td className="py-2 px-4">{request.RequestedBy}</td>
                <td className="py-2 px-4">{request.Purpose}</td>
                <td className="py-2 px-4">{request.ReqBorrowDate}</td>
                <td className="py-2 px-4">{request.Status}</td>
                <td className="py-2 px-4">
                  <button onClick={() => viewRequest(request)}>
                    <FaEye className="text-blue-700 hover:text-blue-800" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedRequestDetails.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-3/4 md:w-1/2">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Request Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <table className="min-w-full">
                <thead className="text-white">
                  <tr>
                    <th className="p-5 text-left">Item Name</th>
                    <th className="p-5 text-left">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRequestDetails.map((item, index) => (
                    <tr key={index}>
                      <td className="p-5">{item.ItemName}</td>
                      <td className="p-5">{item.Quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={closeModal}
                className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
