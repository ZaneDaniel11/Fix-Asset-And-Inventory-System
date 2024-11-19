import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function MaintenanceRequests() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => setAddModalOpen(false);
  const openViewModal = (request) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
  };
  const closeViewModal = () => setViewModalOpen(false);

  const [requestMaintenance, setRequestMaintenance] = useState({
    AssetName: "",
    AssetCode: "",
    Location: "",
    Issue: "",
    Description: "",
  });

  const borrowerId = localStorage.getItem("userId");

  const handleReqMaintenace = async (e) => {
    e.preventDefault();
    try {
      await fetchData(
        `http://localhost:5075/api/MaintenanceApi/InsertMaintenance`,
        "POST",
        {
          id: 0,
          categoryName: newCategory,
        }
      );
      setModalState({ isVisible: false, isEditMode: false, category: null });
      setNewCategory("");
      FetchCategory();
    } catch (error) {
      console.error("Failed to add category", error);
    }
  };

  const requests = [
    {
      id: 1,
      assetType: "Air Conditioning Unit",
      maintenanceDate: "2023-11-20",
      technician: "Bruce Wayne",
      purpose: "Routine Maintenance",
      estimatedCost: "2000",
      status: "Pending",
    },
    {
      id: 2,
      assetType: "Generator",
      maintenanceDate: "2023-11-25",
      technician: "Clark Kent",
      purpose: "Fuel System Check",
      estimatedCost: "5000",
      status: "Approved",
    },
    {
      id: 3,
      assetType: "Elevator",
      maintenanceDate: "2023-11-30",
      technician: "Diana Prince",
      purpose: "Safety Inspection",
      estimatedCost: "10000",
      status: "Rejected",
    },
  ];

  const statusColors = {
    Pending: "bg-yellow-200 text-yellow-700",
    Approved: "bg-green-200 text-green-700",
    Rejected: "bg-red-200 text-red-700",
  };

  const statusIcons = {
    Pending: "fa-hourglass-start",
    Approved: "fa-check-circle",
    Rejected: "fa-times-circle",
  };

  const filteredRequests =
    statusFilter === "All"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  return (
    <div className="flex">
      <Sidebar />
      <div className="limiter">
        <div className="container-table100">
          <div className="wrap-table100">
            <div className="table100">
              <div className="flex justify-between mb-4">
                <button
                  type="button"
                  onClick={openAddModal}
                  className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  <i className="fa-solid fa-plus"></i> Add Maintenance Request
                </button>
                <select
                  className="border rounded-lg px-3 py-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <table>
                <thead>
                  <tr className="table100-head">
                    <th className="column1">Request ID</th>
                    <th className="column2">Asset Type</th>
                    <th className="column3">Maintenance Date</th>
                    <th className="column4">Technician</th>
                    <th className="column5">Purpose</th>
                    <th className="column3">Estimated Cost</th>
                    <th className="column6">Status</th>
                    <th className="column6 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="column1">{request.id}</td>
                      <td className="column2">{request.assetType}</td>
                      <td className="column3">{request.maintenanceDate}</td>
                      <td className="column4">{request.technician}</td>
                      <td className="column5">{request.purpose}</td>
                      <td className="column6">{request.estimatedCost}</td>
                      <td className={`column6 ${statusColors[request.status]}`}>
                        <i
                          className={`fa-solid ${
                            statusIcons[request.status]
                          } me-2`}
                        ></i>
                        {request.status}
                      </td>
                      <td className="flex items-center justify-center mt-2">
                        <button
                          type="button"
                          onClick={() => openViewModal(request)}
                          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                        >
                          <i className="fa-regular fa-eye"></i> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <h5 className="text-lg font-semibold">New Maintenance Request</h5>
            <form onSubmit={handleReqMaintenace}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
                <input
                  className="bg-gray-100 p-3 rounded-lg"
                  type="text"
                  name="assetName"
                  placeholder="Asset Name"
                  required
                />
                <input
                  className="bg-gray-100 p-3 rounded-lg"
                  type="text"
                  name="assetCode"
                  placeholder="Asset Code"
                  required
                />
                <input
                  className="bg-gray-100 p-3 rounded-lg"
                  type="text"
                  name="location"
                  placeholder="Location"
                  required
                />
                <input
                  className="bg-gray-100 p-3 rounded-lg"
                  type="text"
                  name="issue"
                  placeholder="Issue"
                  required
                />
                <input
                  className="bg-gray-100 p-3 rounded-lg"
                  type="date"
                  name="scheduledDate"
                  required
                />
              </div>
              <textarea
                placeholder="Description"
                name="description"
                className="h-32 bg-gray-100 p-3 rounded-lg w-full mt-5"
                required
              ></textarea>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="bg-gray-200 px-4 py-2 rounded-lg mr-2"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Save Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <h5 className="text-lg font-semibold">Request Details</h5>
            {selectedRequest && (
              <div className="mt-4">
                <p>
                  <strong>Asset Type:</strong> {selectedRequest.assetType}
                </p>
                <p>
                  <strong>Maintenance Date:</strong>{" "}
                  {selectedRequest.maintenanceDate}
                </p>
                <p>
                  <strong>Technician:</strong> {selectedRequest.technician}
                </p>
                <p>
                  <strong>Purpose:</strong> {selectedRequest.purpose}
                </p>
                <p>
                  <strong>Estimated Cost:</strong>{" "}
                  {selectedRequest.estimatedCost}
                </p>
                <p>
                  <strong>Status:</strong> {selectedRequest.status}
                </p>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={closeViewModal}
                className="bg-gray-200 px-4 py-2 rounded-lg"
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
