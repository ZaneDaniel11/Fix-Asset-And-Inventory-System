import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function MaintenanceRequests() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Pending", "In Progress");
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
  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/MaintenanceApi/GetMaintenanceByRequester/${RequesterID}`
      );
      if (!response.ok) throw new Error("Failed to fetch maintenance requests");
      const data = await response.json();
      setRequests(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
    }
  };

  useEffect(() => {
    // Fetch maintenance requests

    fetchRequests();
  }, [RequesterID]);

  useEffect(() => {
    const fetchAssetCodes = async () => {
      try {
        const response = await fetch(
          "https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/AssetItemApi/GetAllAssetCodes"
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
        setRequestMaintenance((prev) => ({
          ...prev,
          AssetName: "",
          Location: "",
        })); // Clear fields when Asset Code changes
      } else {
        setIsDropdownOpen(false);
        // Allow manual input for AssetName and Location
        setRequestMaintenance((prev) => ({
          ...prev,
          AssetName: "",
          Location: "",
        }));
      }
    }
  };

  const handleSelectAssetCode = async (code) => {
    setRequestMaintenance((prev) => ({ ...prev, AssetCode: code }));
    setIsDropdownOpen(false);

    try {
      // Fetch asset details based on the selected AssetCode
      const response = await fetch(
        `https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/AssetItemApi/GetAssetByCode?assetCode=${code}`
      );
      if (!response.ok) throw new Error("Failed to fetch asset details");
      const assetData = await response.json();

      // Automatically fill in AssetName and Location
      setRequestMaintenance((prev) => ({
        ...prev,
        AssetName: assetData.assetName || "",
        Location: assetData.location || "",
      }));
    } catch (error) {
      console.error("Error fetching asset details:", error);
      alert("Failed to fetch asset details. Please try again.");
    }
  };

  const handleRequestMaintenance = async (e) => {
    e.preventDefault();

    let itemID = 0;
    let categoryID = 0;
    let assetName = requestMaintenance.AssetName || "Unknown";

    try {
      if (!requestMaintenance.AssetCode) {
        if (!requestMaintenance.AssetName || !requestMaintenance.Location) {
          alert(
            "Please provide either an Asset Code or fill in both the Asset Name and Location."
          );
          return;
        }
      }

      if (requestMaintenance.AssetCode) {
        const assetResponse = await fetch(
          `https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/AssetItemApi/GetAssetByCode?assetCode=${requestMaintenance.AssetCode}`
        );

        if (assetResponse.ok) {
          const assetData = await assetResponse.json();

          if (!assetData.assetId || !assetData.categoryID) {
            throw new Error("Incomplete asset data received from the server.");
          }

          itemID = assetData.assetId;
          categoryID = assetData.categoryID;
          assetName = assetData.assetName;
        } else {
          throw new Error("Failed to fetch asset data. Check the Asset Code.");
        }
      }

      const payload = {
        maintenanceID: 0,
        itemID,
        categoryID,
        assetName,
        assetCode: requestMaintenance.AssetCode || "N/A",
        location: requestMaintenance.Location,
        issue: requestMaintenance.Issue,
        requestDate: new Date().toISOString(),
        requestedBy: RequesterName || "Unknown",
        requesterID: RequesterID,
        maintenanceStatus: "Pending",
        AssignedTo: "",
        RejectBy: "",
        RejectReason: "",
        scheduledDate: null,
        completionDate: null,
        description: requestMaintenance.Description,
        approvalStatus: "Pending",
        approvedByAdmin1: "Pending",
        approvedByAdmin2: "Pending",
      };

      console.log("Submitting payload:", payload);

      const response = await fetch(
        "https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/MaintenanceApi/InsertMaintenance",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Backend error:", errorDetails);
        throw new Error(
          errorDetails.message || "Failed to submit the maintenance request."
        );
      }

      setAddModalOpen(false);
      setRequestMaintenance({
        AssetName: "",
        AssetCode: "",
        Location: "",
        Issue: "",
        Description: "",
      });
      fetchRequests();
      toast.success("Maintenance request submitted successfully!");
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      alert(error.message || "Failed to submit the maintenance request.");
    }
  };

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
          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex justify-between items-center">
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-semibold rounded-lg text-md px-5 py-2 transition duration-150"
            >
              <i className="fa-solid fa-plus mr-2"></i> Add Maintenance Request
            </button>
            {/* <select
              className="border rounded-lg px-4 py-2 text-gray-600 font-medium focus:ring-2 focus:ring-blue-300 transition duration-150"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select> */}
          </div>

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
                        request.maintenanceStatus === "Pending"
                          ? "text-yellow-600"
                          : request.maintenanceStatus === "Rejected"
                          ? "text-red-600"
                          : request.maintenanceStatus === "Approved"
                          ? "text-green-500"
                          : "text-blue-600"
                      }`}
                    >
                      {request.maintenanceStatus}
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

      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full mx-4 md:mx-0 relative">
            <h5 className="text-xl font-bold text-gray-800 mb-4">
              New Maintenance Request
            </h5>
            <form onSubmit={handleRequestMaintenance}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <input
                  className="bg-gray-100 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  name="AssetName"
                  placeholder="Asset Name"
                  value={requestMaintenance.AssetName}
                  onChange={handleChange}
                  readOnly={!!requestMaintenance.AssetCode} // Read-only if AssetCode is provided
                  required
                />

                <div className="relative">
                  <input
                    className="bg-gray-100 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    name="AssetCode"
                    placeholder="Asset Code"
                    value={requestMaintenance.AssetCode}
                    onChange={handleChange}
                  />
                  {isDropdownOpen && (
                    <ul className="absolute z-20 bg-white border rounded-lg w-full shadow-lg max-h-48 overflow-y-auto mt-1">
                      {filteredAssetCodes.map((code, index) => (
                        <li
                          key={index}
                          className="px-3 py-2 hover:bg-blue-100 cursor-pointer transition-colors"
                          onClick={() => handleSelectAssetCode(code)}
                        >
                          {code}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <input
                  className="bg-gray-100 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  name="Location"
                  placeholder="Location"
                  value={requestMaintenance.Location}
                  onChange={handleChange}
                  readOnly={!!requestMaintenance.AssetCode} // Read-only if AssetCode is provided
                  required
                />

                <input
                  className="bg-gray-100 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="bg-gray-100 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 w-full mt-5 h-32"
                value={requestMaintenance.Description}
                onChange={handleChange}
                required
              ></textarea>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-5 py-2 rounded-lg transition duration-150 mr-3"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition duration-150"
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
