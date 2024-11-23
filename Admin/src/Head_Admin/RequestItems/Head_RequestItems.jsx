import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
export default function RequestItems() {
  const [editModal, setEditModalOpen] = useState(false);
  const [viewModal, setViewModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
          Description: item.Description,
        }));
        setItems(mappedItems);
        console.log(mappedItems);
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
      item.Admin1 === "Approved" && // Only show items where Admin1 is Approved
      item.Admin2 === "Pending" // Only show items where Admin2 is Pending
  );

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
      <div className="limiter w-full">
        <div className="container mx-auto p-6">
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-700">
              Request Item Overview
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
          </div>

          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="font-semibold text-md text-zinc-50">
                <tr>
                  <th className="px-6 py-3">Request ID</th>
                  <th className="px-6 py-3">Item Name</th>
                  <th className="px-6 py-3">Requested By</th>
                  <th className="px-6 py-3">Requested Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Admin1</th>
                  <th className="px-6 py-3">Admin2</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="bg-white border-b hover:bg-gray-100"
                  >
                    <td className="px-6 py-4">{item.id}</td>
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4">{item.requestedBy}</td>
                    <td className="px-6 py-4">{item.requestedDate}</td>

                    {/* Status with Conditional Styling */}
                    <td
                      className={`px-6 py-4 ${
                        item.status === "Pending"
                          ? "text-yellow-500"
                          : item.status === "Approved"
                          ? "text-green-500"
                          : item.status === "Rejected"
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {item.status}
                    </td>

                    <td className="px-6 py-4">{item.priority}</td>

                    {/* Admin1 with Conditional Styling */}
                    <td
                      className={`px-6 py-4 ${
                        item.Admin1 === "Pending"
                          ? "text-yellow-500"
                          : item.Admin1 === "Approved"
                          ? "text-green-500"
                          : item.Admin1 === "Rejected"
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {item.Admin1}
                    </td>

                    {/* Admin2 with Conditional Styling */}
                    <td
                      className={`px-6 py-4 ${
                        item.Admin2 === "Pending"
                          ? "text-yellow-500"
                          : item.Admin2 === "Approved"
                          ? "text-green-500"
                          : item.Admin2 === "Rejected"
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {item.Admin2}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 flex justify-center space-x-2">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {/* Edit Admin Approval Modal */}
        {editModal && currentItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-lg">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b pb-3">
                <h5 className="text-lg font-semibold text-gray-800">
                  Edit Admin Approval
                </h5>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              {/* Modal Content */}
              <form>
                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Admin Approval
                  </label>
                  <select
                    className="bg-gray-50 text-gray-900 border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={adminApprovals}
                    onChange={(e) => setAdminApproval(e.target.value)}
                  >
                    <option value="">Select Admin1 Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </form>

              {/* Modal Footer */}
              <div className="flex justify-end mt-5">
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Item Details Modal */}
        {viewModal && currentItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-lg">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b pb-3">
                <h5 className="text-lg font-semibold text-gray-800">
                  View Item Details
                </h5>
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mt-4 space-y-3">
                <p className="text-gray-700">
                  <strong className="font-semibold text-gray-800">
                    Item Name:
                  </strong>{" "}
                  {currentItem.name}
                </p>
                <p className="text-gray-700">
                  <strong className="font-semibold text-gray-800">
                    Requested By:
                  </strong>{" "}
                  {currentItem.requestedBy}
                </p>
                <p className="text-gray-700">
                  <strong className="font-semibold text-gray-800">
                    Requested Date:
                  </strong>{" "}
                  {currentItem.requestedDate}
                </p>
                <p className="text-gray-700">
                  <strong className="font-semibold text-gray-800">
                    Status:
                  </strong>{" "}
                  {currentItem.status}
                </p>
                <p className="text-gray-700">
                  <strong className="font-semibold text-gray-800">
                    Priority:
                  </strong>{" "}
                  {currentItem.priority}
                </p>
                <p className="text-gray-700">
                  <strong className="font-semibold text-gray-800">
                    Description:
                  </strong>{" "}
                  {currentItem.Description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
