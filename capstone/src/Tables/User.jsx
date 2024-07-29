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
  const [users, setUsers] = useState([]);
  const [addUser, setAddUser] = useState({
    name: "",
    username: "",
    password: "",
    usertype: "",
    email: "",
  });

  // Fetch Users Data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}Read.php`);
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, []);

  const openModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const openDeleteModal = () => setDeleteModalOpen(true);

  const closeDeleteModal = () => setDeleteModalOpen(false);

  const openViewModal = (user) => {
    setCurrentItem(user);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setCurrentItem(null);
  };

  const openAddUserModal = () => setAddUserModalOpen(true);

  const closeAddUserModal = () => setAddUserModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddUser({ ...addUser, [name]: value });
  };

  // Handle Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}Create.php`, addUser);
      setAddUser({
        username: "",
        password: "",
        usertype: "",
        email: "",
      });
      closeAddUserModal();
      // Refresh users data
      const response = await axios.get(`${API_URL}Read.php`);
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to add user", error);
    }
  };

  const handleDeleteUser = async () => {
    if (currentItem && currentItem.UserId) {
      try {
        const response = await axios.delete(`${API_URL}Delete.php`, {
          params: { id: currentItem.UserId },
        });

        if (response.data.success) {
          // Successfully deleted
          closeDeleteModal();
          // Refresh users data
          const updatedUsersResponse = await axios.get(`${API_URL}Read.php`);
          setUsers(updatedUsersResponse.data);
        } else {
          console.error("Failed to delete user:", response.data.error);
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    } else {
      console.error("No user ID provided for deletion.");
    }
  };

  const handleEditUser = async () => {
    closeModal();
    const response = await axios.get(`${API_URL}Read.php`);
    setUsers(response.data);
  };

  // Filter Users
  const filteredUsers = users.filter(
    (user) =>
      user.UserName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (userTypeQuery === "" || user.UserType === userTypeQuery)
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
                    <th className="column5">Created Date</th>
                    <th className="column6">User Type</th>
                    <th className="column6">Operation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.UserId}>
                      <td className="column1">{user.UserId}</td>
                      <td className="column2">{user.UserName}</td>
                      <td className="column3">{user.Password}</td>
                      <td className="column5">{user.CreatedDate}</td>
                      <td className="column6">{user.UserType}</td>
                      <td className="column6">
                        <button
                          type="button"
                          onClick={() => openModal(user)}
                          className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => {
                            setCurrentItem(user);
                            openDeleteModal();
                          }}
                          type="button"
                          className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                        <button
                          onClick={() => openViewModal(user)}
                          type="button"
                          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                          <i className="fa-solid fa-eye"></i>
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
            <form onSubmit={handleEditUser}>
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
                  <div className="relative">
                    <input
                      type="text"
                      name="UserName"
                      value={currentItem?.UserName || ""}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          UserName: e.target.value,
                        })
                      }
                      className="p-2 border rounded border-black w-full"
                      placeholder="User Name"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="Password"
                      value={currentItem?.Password || ""}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          Password: e.target.value,
                        })
                      }
                      className="p-2 border rounded border-black w-full"
                      placeholder="Password"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="Email"
                      value={currentItem?.Email || ""}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          Email: e.target.value,
                        })
                      }
                      className="p-2 border rounded border-black w-full"
                      placeholder="Email"
                    />
                  </div>
                  <div className="relative">
                    <select
                      name="UserType"
                      value={currentItem?.UserType || ""}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          UserType: e.target.value,
                        })
                      }
                      className="p-2 border rounded border-black w-full"
                    >
                      <option value="">Select User Type</option>
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-white bg-gray-700 hover:bg-gray-800 font-medium rounded-lg text-sm px-4 py-2 me-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Confirm Deletion</h5>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="mt-4">
              <p>Are you sure you want to delete this user?</p>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="text-white bg-gray-700 hover:bg-gray-800 font-medium rounded-lg text-sm px-4 py-2 me-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-4 py-2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">View User</h5>
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
                <strong>User ID:</strong> {currentItem?.UserId}
              </p>
              <p>
                <strong>User Name:</strong> {currentItem?.UserName}
              </p>
              <p>
                <strong>Email:</strong> {currentItem?.Email}
              </p>
              <p>
                <strong>Created Date:</strong> {currentItem?.CreatedDate}
              </p>
              <p>
                <strong>User Type:</strong> {currentItem?.UserType}
              </p>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="text-white bg-gray-700 hover:bg-gray-800 font-medium rounded-lg text-sm px-4 py-2"
                >
                  Close
                </button>
              </div>
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
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={addUser.username}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                      placeholder="Username"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={addUser.password}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                      placeholder="Password"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={addUser.email}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                      placeholder="Email"
                    />
                  </div>
                  <div className="relative">
                    <select
                      name="usertype"
                      value={addUser.usertype}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                    >
                      <option value="">Select User Type</option>
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={closeAddUserModal}
                    className="text-white bg-gray-700 hover:bg-gray-800 font-medium rounded-lg text-sm px-4 py-2 me-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
                  >
                    Add User
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
