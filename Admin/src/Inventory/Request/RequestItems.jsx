import React, { useState, useEffect } from "react";
import "../CSS/Electronics.css";

export default function RequestItems() {
  const [editModal, setEditModalOpen] = useState(false);
  const [viewModal, setViewModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [admin1Approvals, setAdmin1Approval] = useState(""); // State for approval selection

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
          Cost: item.estimatedCost,
          dealer: item.suggestedDealer,
          description: item.description,
        }));
        setItems(mappedItems);
      })

      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const openEditModal = (item) => {
    setCurrentItem(item);
    setAdmin1Approval(item.Admin1);
    setEditModalOpen(true);
  };
  const closeEditModal = () => setEditModalOpen(false);

  const openViewModal = (item) => {
    setCurrentItem(item);
    setViewModalOpen(true);
  };
  const closeViewModal = () => setViewModalOpen(false);

  // const filteredItems = items.filter(
  //   (item) =>
  //     item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
  //     (statusQuery === "" || item.status === statusQuery)
  // );

  const filteredItems = items.filter(
    (item) => item.status === "Pending" && item.Admin1 === "Pending"
  );
  const handleSaveChanges = () => {
    console.log("Sending update request with data:", admin1Approvals);

    fetch(
      `http://localhost:5075/api/RequestItemsApi/UpdateAdmin1Approval/${currentItem.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(admin1Approvals), // Pass the string directly as the body
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
            ? { ...item, Admin1: admin1Approvals } // Update the item's Admin1 field
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
          {/* Header Section */}
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-700">Request List</h2>
          </div>

          {/* Search Input */}
          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search by Item Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded border-black"
            />
          </div>

          {/* Table */}
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
                  <th className="border border-gray-300 px-5 py-3">Admin1</th>
                  <th className="border border-gray-300 px-5 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
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
                      className={`border border-gray-300 px-5 py-3 ${
                        item.status === "Pending"
                          ? "text-yellow-600"
                          : item.status === "Canceled"
                          ? "text-red-600"
                          : item.status === "In Progress"
                          ? "text-blue-600"
                          : item.status === "Rejected"
                          ? "text-red-600"
                          : item.status === "Approved"
                          ? "text-green-500"
                          : "text-gray-600"
                      }`}
                    >
                      {item.status}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 ${
                        item.priority === "High"
                          ? "text-red-600 font-bold"
                          : item.priority === "Medium"
                          ? "text-yellow-600 font-medium"
                          : item.priority === "Low"
                          ? "text-green-600 font-light"
                          : "text-gray-600"
                      }`}
                    >
                      {item.priority}
                    </td>
                    <td
                      className={`border border-gray-300 px-5 py-3 ${
                        item.Admin1 === "Pending"
                          ? "text-yellow-600"
                          : item.Admin1 === "Rejected"
                          ? "text-red-600"
                          : item.Admin1 === "Approved"
                          ? "text-green-500"
                          : "text-gray-600"
                      }`}
                    >
                      {item.Admin1}
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
                          className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-1.5"
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
              <h5 className="text-lg font-semibold">Edit Admin1 Approval</h5>
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
                    value={admin1Approvals}
                    onChange={(e) => setAdmin1Approval(e.target.value)}
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
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 md:mx-0 shadow-lg relative">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h5 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <i className="fa-solid fa-info-circle"></i> Item Details
              </h5>
              <button
                type="button"
                onClick={closeViewModal}
                className="text-gray-500 hover:text-red-600"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-box text-blue-500 text-lg"></i>
                <p>
                  <strong>Item Name:</strong> {currentItem.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-user text-green-500 text-lg"></i>
                <p>
                  <strong>Requested By:</strong> {currentItem.requestedBy}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-calendar-alt text-yellow-500 text-lg"></i>
                <p>
                  <strong>Requested Date:</strong> {currentItem.requestedDate}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <i
                  className={`fa-solid ${
                    currentItem.status === "Pending"
                      ? "fa-hourglass-half text-yellow-600"
                      : currentItem.status === "Approved"
                      ? "fa-check-circle text-green-500"
                      : currentItem.status === "Rejected"
                      ? "fa-times-circle text-red-600"
                      : "fa-info-circle text-gray-500"
                  } text-lg`}
                ></i>
                <p>
                  <strong>Status:</strong> {currentItem.status}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <i
                  className={`fa-solid fa-exclamation-circle ${
                    currentItem.priority === "High"
                      ? "text-red-600"
                      : currentItem.priority === "Medium"
                      ? "text-yellow-500"
                      : "text-green-500"
                  } text-lg`}
                ></i>
                <p>
                  <strong>Priority:</strong> {currentItem.priority}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-store text-purple-500 text-lg"></i>
                <p>
                  <strong>Suggested Dealer:</strong> {currentItem.dealer}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-dollar-sign text-green-500 text-lg"></i>
                <p>
                  <strong>Estimated Cost:</strong> {currentItem.Cost}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-file-alt text-gray-500 text-lg"></i>
                <p>
                  <strong>Description:</strong> {currentItem.description}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end mt-6 border-t pt-4">
              <button
                type="button"
                onClick={closeViewModal}
                className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600"
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
