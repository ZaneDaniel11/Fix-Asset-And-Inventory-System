import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function MaintenanceRequests() {
  const API_URL = "http://localhost:5075/api/MaintenanceApi";
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Pending", "In Progress");
  const [requests, setRequests] = useState([]);

  const openViewModal = (request) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
  };

  const closeViewModal = () => setViewModalOpen(false);

  const RequesterID = localStorage.getItem("userId");
  const RequesterName = localStorage.getItem("name");
  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/GetAllMaintenanceRequest`);
      if (!response.ok) throw new Error("Failed to fetch maintenance requests");
      const data = await response.json();
      setRequests(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests =
    statusFilter === "All"
      ? requests.filter(
          (request) =>
            request.maintenanceStatus === "Pending" ||
            request.maintenanceStatus === "In Progress"
        )
      : requests.filter(
          (request) => request.maintenanceStatus === statusFilter
        );

  return (
    <>
      <div className="limiter w-full">
        <div className="container mx-auto p-6">
          {/* Header Section */}
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-700">
              Maintenance Requests
            </h2>
          </div>

          {/* Action Section */}
          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex justify-between items-center"></div>

          {/* Table Section */}
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full border-collapse border border-gray-200 bg-white">
              <thead className="bg-gray-200">
                <tr className="font-semibold text-md text-zinc-50">
                  <th className="border border-gray-300 px-5 py-3">
                    Request ID
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Asset Name
                  </th>
                  <th className="border border-gray-300 px-5 py-3">
                    Request Date
                  </th>
                  <th className="border border-gray-300 px-5 py-3">Location</th>
                  <th className="border border-gray-300 px-5 py-3">Issue</th>
                  <th className="border border-gray-300 px-5 py-3">Status</th>
                  <th className="border border-gray-300 px-5 py-3">Approval</th>
                  <th className="border border-gray-300 px-5 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request, index) => (
                  <tr
                    key={request.maintenanceID}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition duration-200`}
                  >
                    <td className="border border-gray-300 px-5 py-3">
                      {request.maintenanceID}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {request.assetName}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {request.location}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {request.issue}
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-2 font-medium ${
                        request.approvalStatus === "Pending"
                          ? "text-yellow-600"
                          : request.approvalStatus === "Rejected"
                          ? "text-red-600"
                          : request.approvalStatus === "Approved"
                          ? "text-green-500"
                          : "text-blue-600"
                      }`}
                    >
                      {request.approvalStatus}
                    </td>
                    <td className="border border-gray-300 px-5 py-3">
                      {request.approvedByAdmin1}
                    </td>
                    <td className="border border-gray-300 px-5 py-3 text-center">
                      <div className="flex items-center gap-4 justify-center">
                        <button
                          type="button"
                          onClick={() => openViewModal(request)}
                          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 transition duration-150"
                        >
                          <i className="fa-regular fa-eye"></i> View
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

      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full mx-4 md:mx-0 relative">
            <h5 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
              Request Details
            </h5>
            {selectedRequest && (
              <div className="space-y-4 text-gray-700">
                <p className="flex justify-between">
                  <span className="font-semibold">Request ID:</span>
                  <span>{selectedRequest.maintenanceID}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Asset Name:</span>
                  <span>{selectedRequest.assetName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Request Date:</span>
                  <span>
                    {new Date(selectedRequest.requestDate).toLocaleDateString()}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Location:</span>
                  <span>{selectedRequest.location}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Issue:</span>
                  <span>{selectedRequest.issue}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Description:</span>
                  <span>{selectedRequest.description}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full font-medium ${
                      selectedRequest.maintenanceStatus === "Pending"
                        ? "bg-yellow-200 text-yellow-800"
                        : selectedRequest.maintenanceStatus === "Approved"
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {selectedRequest.maintenanceStatus}
                  </span>
                </p>
              </div>
            )}
            <div className="flex justify-end mt-8">
              <button
                onClick={closeViewModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-md transition duration-200 transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
