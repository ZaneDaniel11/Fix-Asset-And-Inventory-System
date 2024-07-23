import React, { useState } from "react";

export default function Maintenance() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModal, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [items, setItems] = useState([
    {
      id: 2,
      name: "Item 1",
      schedule: "2017-09-26 05:57",
      status: "Complete",
    },
    {
      id: 3,
      name: "Item 2",
      schedule: "2018-03-15 11:23",
      status: "In Progress",
    },
    {
      id: 4,
      name: "Item 3",
      schedule: "2019-01-10 09:30",
      status: "Pending",
    },
    // Add more items as needed
  ]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusQuery === "" || item.status === statusQuery)
  );

  return (
    <>
      <div className="limiter">
        <div className="container-table100">
          <div className="wrap-table100">
            <div className="table100">
              <div className="flex justify-between mb-4">
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
              <table>
                <thead>
                  <tr className="table100-head">
                    <th className="column1">Maintenance ID</th>
                    <th className="column2">Item Name</th>
                    <th className="column3">Schedule</th>
                    <th className="column4">Status</th>
                    <th className="column5" style={{ paddingRight: 20 }}>
                      Operation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td className="column1">{item.id}</td>
                      <td className="column2">{item.name}</td>
                      <td className="column3">{item.schedule}</td>
                      <td className="column4">{item.status}</td>
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

      {addModal && (
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
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="text"
                    placeholder="Item Name"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="text"
                    placeholder="Quantity"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="email"
                    placeholder="Unit Price"
                  />
                </div>
                <div className="my-4">
                  <textarea
                    placeholder="Description"
                    className="h-32 bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline w-full border border-black"
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
