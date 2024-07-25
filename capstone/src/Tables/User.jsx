import React, { useState } from "react";

export default function Users() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModal, setIsModalOpen] = useState(false);
  const [viewModal, setViewModalOpen] = useState(false);
  const [addUserModal, setAddUserModalOpen] = useState(false); // State for add user modal
  const [currentItem, setCurrentItem] = useState(null); // State for current item
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeQuery, setUserTypeQuery] = useState("");
  const [items, setItems] = useState([
    {
      id: 2,
        name: "Edison Pagatpat",
      username: "Pagatpat",
      password: "Password21",
      createdDate: "2017-09-26 05:57",
      usertype: "Member",
    },
    {
      id: 3,
      username: "Pelayo",
      password: "Password21",
      createdDate: "2017-09-26 05:57",
      usertype: "Admin",
    },
    {
      id: 4,
      username: "Pino",
      password: "Password21",
      createdDate: "2017-09-26 05:57",
      usertype: "Member",
    },

  ]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const openViewModal = (item) => {
    setCurrentItem(item);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setCurrentItem(null);
  };

  const openAddUserModal = () => {
    setAddUserModalOpen(true);
  };

  const closeAddUserModal = () => {
    setAddUserModalOpen(false);
  };

  const filteredItems = items.filter(
    (item) =>
      item.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (userTypeQuery === "" || item.usertype === userTypeQuery)
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
                  placeholder="Search by User Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-2 border rounded border-black"
                />
                <select
                  value={userTypeQuery}
                  onChange={(e) => setUserTypeQuery(e.target.value)}
                  className="p-2 border rounded border-black"
                >
                  <option value="">All User Types</option>
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                </select>
                <button
                  onClick={openAddUserModal}
                  className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
                >
                  <i className="fa-solid fa-plus"></i> Add User
                </button>
              </div>
              <table>
                <thead>
                  <tr className="table100-head">
                    <th className="column1">User ID</th>
                    <th className="column2">User Name</th>
                    <th className="column3">Password</th>
                    <th className="column4">Created Date</th>
                    <th className="column5">User Type</th>
                    <th className="column6">Operation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    return (
                      <tr key={item.id}>
                        <td className="column1">{item.id}</td>
                        <td className="column2">{item.username}</td>
                        <td className="column3">{item.password}</td>
                        <td className="column4">{item.createdDate}</td>
                        <td className="column5">{item.usertype}</td>
                        <td className="column6">
                          <button
                            type="button"
                            onClick={() => openModal(item)}
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
                          <button
                            onClick={() => openViewModal(item)}
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                          >
                            <i className="fa-solid fa-eye"></i>
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
      </div>

      {editModal && (
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
                    placeholder="Name"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="text"
                    placeholder="Username"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="date"
                    placeholder="Schedule"
                  />
                  <select
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                  </select>
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

      {viewModal && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <h5 className="text-lg font-semibold">View User</h5>
            <div className="mt-4">
              <p><strong>User ID:</strong> {currentItem.id}</p>
              <p><strong>User ID:</strong> {currentItem.name}</p>
              <p><strong>User Name:</strong> {currentItem.username}</p>
              <p><strong>Password:</strong> {currentItem.password}</p>
              <p><strong>Created Date:</strong> {currentItem.createdDate}</p>
              <p><strong>User Type:</strong> {currentItem.usertype}</p>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={closeViewModal}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {addUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Add User</h5>
              <button
                type="button"
                onClick={closeAddUserModal}
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
                    placeholder="User Name"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="password"
                    placeholder="Password"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="date"
                    placeholder="Created Date"
                  />
                  <select
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeAddUserModal}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Add User
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
