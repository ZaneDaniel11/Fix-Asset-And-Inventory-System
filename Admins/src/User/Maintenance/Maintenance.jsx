import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

export default function MaintenanceRequests() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [allAssetCodes, setAllAssetCodes] = useState([]);
  const [filteredAssetCodes, setFilteredAssetCodes] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [requests, setRequests] = useState([]);

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

  const RequesterID = localStorage.getItem("userId");
  const RequesterName = localStorage.getItem("name");

  useEffect(() => {
    // Fetch maintenance requests
    const fetchRequests = async () => {
      try {
        const response = await fetch(
          `http://localhost:5075/api/MaintenanceApi/GetMaintenanceByRequester/${RequesterID}`
        );
        if (!response.ok)
          throw new Error("Failed to fetch maintenance requests");
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching maintenance requests:", error);
      }
    };

    fetchRequests();
  }, [RequesterID]);

  useEffect(() => {
    const fetchAssetCodes = async () => {
      try {
        const response = await fetch(
          "http://localhost:5075/api/AssetItemApi/GetAllAssetCodes"
        );
        if (!response.ok) throw new Error("Failed to fetch asset codes");
        const data = await response.json();
        setAllAssetCodes(data);
      } catch (error) {
        console.error("Error fetching asset codes:", error);
      }
    };

    fetchAssetCodes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestMaintenance((prev) => ({ ...prev, [name]: value }));

    if (name === "AssetCode") {
      if (value) {
        const filtered = allAssetCodes.filter((code) =>
          code.toLowerCase().startsWith(value.toLowerCase())
        );
        setFilteredAssetCodes(filtered);
        setIsDropdownOpen(filtered.length > 0);
      } else {
        setIsDropdownOpen(false);
      }
    }
  };

  const handleSelectAssetCode = (code) => {
    setRequestMaintenance((prev) => ({ ...prev, AssetCode: code }));
    setIsDropdownOpen(false);
  };

  const handleRequestMaintenance = async (e) => {
    e.preventDefault();

    let itemID = 0; // Default value
    let categoryID = 0; // Default value
    let assetName = requestMaintenance.AssetName; // Use user-provided name if asset not found

    try {
      if (requestMaintenance.AssetCode) {
        // Fetch asset details only if AssetCode is provided
        const assetResponse = await fetch(
          `http://localhost:5075/api/AssetItemApi/GetAssetByCode?assetCode=${requestMaintenance.AssetCode}`
        );

        if (assetResponse.ok) {
          const assetData = await assetResponse.json();
          itemID = assetData.assetId; // Set AssetID from the fetched data
          categoryID = assetData.categoryID; // Set CategoryID from the fetched data
          assetName = assetData.assetName; // Use fetched AssetName
        }
      }

      // Submit the maintenance request
      const response = await fetch(
        "http://localhost:5075/api/MaintenanceApi/InsertMaintenance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            maintenanceID: 0,
            itemID, // Use retrieved or default value
            categoryID, // Use retrieved or default value
            assetName, // Use retrieved or user-provided name
            assetCode: requestMaintenance.AssetCode || "N/A", // Use user input or default
            location: requestMaintenance.Location, // User-provided location
            issue: requestMaintenance.Issue, // User-provided issue
            requestDate: new Date().toISOString(), // Current date
            requestedBy: RequesterName || "none", // Placeholder
            requesterID: RequesterID, // User's ID
            maintenanceStatus: "Pending", // Default status
            assignedTo: "string", // Placeholder
            scheduledDate: null,
            completionDate: null,
            description: requestMaintenance.Description, // User-provided description
            approvalStatus: "Pending", // Default approval status
            approvedByAdmin1: "Pending",
            approvedByAdmin2: "Pending",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit the maintenance request.");
      }

      // Reset the form and close the modal
      setAddModalOpen(false);
      setRequestMaintenance({
        AssetName: "",
        AssetCode: "",
        Location: "",
        Issue: "",
        Description: "",
      });
      alert("Maintenance request submitted successfully.");
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      alert(error.message || "Failed to submit the maintenance request.");
    }
  };

  const filteredRequests =
    statusFilter === "All"
      ? requests
      : requests.filter(
          (request) => request.maintenanceStatus === statusFilter
        );

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
                    <th className="column2">Asset Name</th>
                    <th className="column3">Request Date</th>
                    <th className="column4">Location</th>
                    <th className="column5">Issue</th>
                    <th className="column6">Status</th>
                    <th className="column7 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.maintenanceID}>
                      <td className="column1">{request.maintenanceID}</td>
                      <td className="column2">{request.assetName}</td>
                      <td className="column3">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </td>
                      <td className="column4">{request.location}</td>
                      <td className="column5">{request.issue}</td>
                      <td className="column6 ">{request.maintenanceStatus}</td>
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
            <form onSubmit={handleRequestMaintenance}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
                <input
                  className="bg-gray-100 p-3 rounded-lg"
                  type="text"
                  name="AssetName"
                  placeholder="Asset Name"
                  value={requestMaintenance.AssetName}
                  onChange={handleChange}
                  required
                />
                <div className="relative">
                  <input
                    className="bg-gray-100 p-3 rounded-lg w-full"
                    type="text"
                    name="AssetCode"
                    placeholder="Asset Code"
                    value={requestMaintenance.AssetCode}
                    onChange={handleChange}
                    required
                  />
                  {isDropdownOpen && (
                    <ul className="absolute z-10 bg-white border rounded-lg w-full shadow-md max-h-48 overflow-y-auto">
                      {filteredAssetCodes.map((code, index) => (
                        <li
                          key={index}
                          className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                          onClick={() => handleSelectAssetCode(code)}
                        >
                          {code}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <input
                  className="bg-gray-100 p-3 rounded-lg"
                  type="text"
                  name="Location"
                  placeholder="Location"
                  value={requestMaintenance.Location}
                  onChange={handleChange}
                  required
                />
                <input
                  className="bg-gray-100 p-3 rounded-lg"
                  type="text"
                  name="Issue"
                  placeholder="Issue"
                  value={requestMaintenance.Issue}
                  onChange={handleChange}
                  required
                />
              </div>
              <textarea
                placeholder="Description"
                name="Description"
                className="h-32 bg-gray-100 p-3 rounded-lg w-full mt-5"
                value={requestMaintenance.Description}
                onChange={handleChange}
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
    </div>
  );
}
