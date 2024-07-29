import React, { useEffect, useState } from "react";
import axios from "axios";
const API_URL =
  "http://localhost/Fix-Asset-And-Inventory-System/Backend/Users/";

export default function Users() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModal, setIsModalOpen] = useState(false);
  const [viewModal, setViewModalOpen] = useState(false);
  const [addUserModal, setAddUserModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeQuery, setUserTypeQuery] = useState("");
  const [users, FetchUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    password: "",
    createdDate: "",
    usertype: "",
    email: "",
  });

  useEffect(() => {
    const Fetch = async () => {
      const response = await axios.get(`${API_URL}Read.php`);
      FetchUsers(response.data);
      console.log(response.data);
    };
    Fetch();
  }, [users]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const openViewModal = (users) => {
    setCurrentItem(users);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost/Fix-Asset-And-Inventory-System/Backend/Users/Create.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setItems([...items, result.user]);
          closeAddUserModal();
        } else {
          alert("Failed to add user: " + result.message);
        }
      } else {
        const errorResult = await response.json();
        alert("Error: " + errorResult.message);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };
  const filteredUsers = users.filter(
    (users) =>
      users.UserName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (userTypeQuery === "" || users.UserType === userTypeQuery)
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
                    <th className="column4">Email</th>
                    <th className="column5">Created Date</th>
                    <th className="column6">User Type</th>
                    <th className="column6">Operation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((users) => {
                    return (
                      <tr key={users.UserId}>
                        <td className="column1">{users.UserId}</td>
                        <td className="column2">{users.UserName}</td>
                        <td className="column3">{users.Password}</td>
                        <td className="column4">{users.Email}</td>
                        <td className="column5">{users.CreatedDate}</td>
                        <td className="column6">{users.UserType}</td>
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
                            onClick={() => openViewModal(users)}
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
                  <select className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black">
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">View</h5>
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
                <strong>Users ID:</strong> {currentItem?.UserId}
              </p>
              <p>
                <strong>Username:</strong> {currentItem?.UserName}
              </p>
              <p>
                <strong>Password:</strong> {currentItem?.Password}
              </p>
              <p>
                <strong>Password:</strong> {currentItem?.Email}
              </p>
              <p>
                <strong>Created Date:</strong> {currentItem?.CreatedDate}
              </p>
              <p>
                <strong>User Type:</strong> {currentItem?.UserType}
              </p>
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

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Delete</h5>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <p>Are you sure you want to delete this user?</p>
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
            <form onSubmit={handleAddUser}>
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="text"
                    placeholder="Name"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="text"
                    placeholder="Username"
                    name="username"
                    value={newUser.username}
                    onChange={handleInputChange}
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="date"
                    placeholder="Created Date"
                    name="createdDate"
                    value={newUser.createdDate}
                    onChange={handleInputChange}
                  />
                  <select
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    name="usertype"
                    value={newUser.usertype}
                    onChange={handleInputChange}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                  </select>
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeAddUserModal}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
