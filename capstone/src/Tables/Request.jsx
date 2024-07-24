import React, { useState } from "react";

export default function RequestItems() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [add_modal, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openDeleteModal = () => setDeleteModalOpen(true);
  const closeDeleteModal = () => setDeleteModalOpen(false);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const data = [
    {
      id: 2,
      requestedBy: "CSS Department",
      requestedDate: "2017-09-26 05:57",
      status: "Pending",
      priority: "Medium",
    },
    // Add more items as needed
  ];

  const filteredData = data.filter(
    (item) =>
      (item.status === statusFilter || statusFilter === "") &&
      (item.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requestedDate.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="limiter">
        <div className="container-table100">
          <div className="wrap-table100">
            <div className="flex justify-between mb-4">
              {/* Search bar */}
              <input
                type="text"
                id="searchBar"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
              />

              {/* Select input for filtering */}
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleStatusChange}
                className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="inprogress">In Progress</option>
                <option value="complete">Complete</option>
              </select>
            </div>

            <div className="table100">
              <table>
                <thead>
                  <tr className="table100-head">
                    <th className="column1">Item ID</th>
                    <th className="column2">Requested by</th>
                    <th className="column3">Requested Date</th>
                    <th className="column4">Status</th>
                    <th className="column5">Priority</th>
                    <th className="column6">Operation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id}>
                      <td className="column1">{item.id}</td>
                      <td className="column2">{item.requestedBy}</td>
                      <td className="column3">{item.requestedDate}</td>
                      <td className="column4">{item.status}</td>
                      <td className="column5">{item.priority}</td>
                      <td className="flex items-center justify-center mt-2">
                        <button
                          type="button"
                          onClick={openModal}
                          className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={openDeleteModal}
                          type="button"
                          className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                        >
                          <i className="fa-solid fa-trash"></i>
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

      {add_modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Edit</h5>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form action="">
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="text"
                    placeholder="Requested By"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="text"
                    placeholder="Requested Date"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="email"
                    placeholder="Status"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="email"
                    placeholder="Priority"
                  />
                </div>
                <div className="my-4">
                  <textarea
                    placeholder="Description"
                    className="h-32 bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline w-full"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <h5 className="text-lg font-semibold">
              Are you sure you want to delete?
            </h5>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
