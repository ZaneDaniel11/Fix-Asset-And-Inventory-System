import React, { useState, useEffect } from "react";

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
          Admin3: item.admin3Approval,
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

  // Filter items by search query, status, and Admin1 approval
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusQuery === "" || item.status === statusQuery) &&
      item.Admin2 === "Approved" // Only show approved items
  );

  const getStatusInfo = (status) => {
    switch (status) {
      case "Complete":
        return {
          className: "text-green-500",
          icon: "fa-check-circle",
          spin: false,
        };
      case "In Progress":
        return { className: "text-yellow-500", icon: "fa-spinner", spin: true };
      case "Pending":
        return {
          className: "text-red-500",
          icon: "fa-exclamation-circle",
          spin: false,
        };
      default:
        return { className: "", icon: null, spin: false };
    }
  };

  const handleSaveChanges = () => {
    fetch(
      `http://localhost:5075/api/RequestItemsApi/UpdateAdmin3Approval/${currentItem.id}`,
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
            ? { ...item, Admin3: adminApprovals } // Update the item's Admin1 field
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
    </>
  );
}
