import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";

export default function RequestItems() {
  const [editModal, setEditModalOpen] = useState(false);
  const [viewModal, setViewModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [items, setItems] = useState([]);
  const [adminApprovals, setAdminApproval] = useState(""); // State for approval selection

  // Fetch API data
  useEffect(() => {
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
        setItems(mappedItems);
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
  const closeViewModal = () => setViewModalOpen(false);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusQuery === "" || item.status === statusQuery) &&
      item.Admin1 === "Approved" && // Only show items where Admin1 is Approved
      item.Admin2 === "Pending" // Only show items where Admin2 is Pending
  );

  const getStatusInfo = (status) => {
    switch (status) {
      case "Approved":
        return {
          className: "text-green-500",
          icon: "fa-check-circle",
          spin: false,
        };
      case "In Progress":
        return { className: "text-yellow-500", icon: "fa-spinner" };
      case "Pending":
        return {
          className: "text-red-500",
          icon: "fa-exclamation-circle",
        };
      default:
        return { className: "", icon: null, spin: false };
    }
  };

  const getAdminApprovalInfo = (approval) => {
    switch (approval) {
      case "Approved":
        return {
          className: "text-green-500",
          icon: "fa-check-circle", // Icon for Approved
        };
      case "Pending":
        return {
          className: "text-red-500",
          icon: "fa-hourglass-half", // Icon for Pending
        };
      case "Declined":
        return {
          className: "text-gray-500",
          icon: "fa-times-circle", // Icon for Declined
        };
      default:
        return {
          className: "",
          icon: null, // No icon for other statuses
        };
    }
  };

  const handleSaveChanges = () => {
    fetch(
      `http://localhost:5075/api/RequestItemsApi/UpdateAdmin2Approval/${currentItem.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminApprovals), // Pass the string directly as the body
      }
    )
      .then((response) => {
        if (!response.ok) {
          console.log("Response status:", response.status);
          return response.text(); // Log error message if the response isn't OK
        }
        return response.text(); // Parse response as a string
      })
      .then((message) => {
        console.log("Request updated:", message); // Log success message

        // Optionally update the UI if necessary
        const updatedItems = items.map((item) =>
          item.id === currentItem.id
            ? { ...item, Admin2: adminApprovals } // Update the item's Admin1 field
            : item
        );
        setItems(updatedItems);
        closeEditModal(); // Close the modal after saving
      })
      .catch((error) => {
        console.error("Error updating request:", error);
      });
  };

  return (
    <>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="container mx-auto bg-white shadow-md rounded-lg p-6">
            <div className="bg-gray-200 p-4 shadow-lg rounded-lg mb-6 text-center">
              <h2 className="text-2xl font-bold">Request Overview</h2>
            </div>

            <div className="flex justify-between mb-4 shadow-lg p-6 bg-white rounded-lg mb-6">
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
                    <th className="column7" style={{ paddingRight: 20 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const statusInfo = getStatusInfo(item.status);
                    const admin1Info = getAdminApprovalInfo(item.Admin1);
                    const admin2Info = getAdminApprovalInfo(item.Admin2);
                    return (
                      <tr key={item.id}>
                        <td className="column1">{item.id}</td>
                        <td className="column2">{item.name}</td>
                        <td className="column3">{item.requestedBy}</td>
                        <td className="column4">{item.requestedDate}</td>
                        <td className={`column5 ${statusInfo.className}`}>
                          <i
                            className={`fa ${statusInfo.icon} ${
                              statusInfo.spin ? "spin" : ""
                            } mr-2`}
                          ></i>
                          {item.status}
                        </td>
                        <td className="column6">{item.priority}</td>
                        {/* Admin1 cell with color and icon */}
                        <td className={`column6 ${admin1Info.className}`}>
                          <i className={`fa ${admin1Info.icon} mr-1`}></i>
                          {item.Admin1}
                        </td>
                        {/* Admin2 cell with color and icon */}
                        <td className={`column6 ${admin2Info.className}`}>
                          <i className={`fa ${admin2Info.icon} mr-1`}></i>
                          {item.Admin2}
                        </td>
                        <td className="flex items-center justify-center mt-2 space-x-2">
                          <button
                            type="button"
                            onClick={() => openViewModal(item)}
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editModal && currentItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
              <div className="flex justify-between items-center">
                <h5 className="text-lg font-semibold">Edit Admin Approval</h5>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <form>
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-5 mt-5">
                    <select
                      className="bg-gray-100 text-gray-900 mt-2 p-3 w-full rounded-lg"
                      value={adminApprovals}
                      onChange={(e) => setAdminApproval(e.target.value)}
                    >
                      <option value="">Select Admin1 Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </div>
                </div>
              </form>
              <div className="flex justify-end mt-5">
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {viewModal && currentItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
              <div className="flex justify-between items-center">
                <h5 className="text-lg font-semibold">View Item Details</h5>
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="mt-4">
                <p>
                  <strong>Item Name:</strong> {currentItem.name}
                </p>
                <p>
                  <strong>Requested By:</strong> {currentItem.requestedBy}
                </p>
                <p>
                  <strong>Requested Date:</strong> {currentItem.requestedDate}
                </p>
                <p>
                  <strong>Status:</strong> {currentItem.status}
                </p>
                <p>
                  <strong>Priority:</strong> {currentItem.priority}
                </p>
                <p>
                  <strong>Description:</strong> Lorem ipsum dolor sit amet,
                  consectetur adipiscing elit.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
