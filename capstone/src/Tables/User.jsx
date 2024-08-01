import React, { useEffect, useState } from "react";
import axios from "axios";
import { FetchUserss } from "../Handlers/Users/Read";

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
  const openAddUserModal = () => setAddUserModalOpen(true);
  const closeAddUserModal = () => setAddUserModalOpen(false);

  const closeModal = () => setIsModalOpen(false);

  const openDeleteModal = () => setDeleteModalOpen(true);

  const closeDeleteModal = () => setDeleteModalOpen(false);

  const [addUser, setAddUser] = useState({
    UserName: "",
    Password: "",
    UserType: "",
    Email: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `http://localhost/Fix-Asset-And-Inventory-System/Backend/Users/Read.php`
        );
        setUsers(response.data);
        console.log(response);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async () => {
    if (currentItem && currentItem.UserId) {
      const response = await axios.delete(`${API_URL}Delete.php`, {
        params: { id: currentItem.UserId },
      });
      if (response.data.success) {
        closeDeleteModal();
        const UpdateData = await axios.get(`${API_URL}Read.php`);
        setUsers(UpdateData.data);
      }
    }
  };

  const openModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const openViewModal = (user) => {
    setCurrentItem(user);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setCurrentItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddUser({ ...addUser, [name]: value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    console.log("Data to be sent:", addUser); // Log the data to be sent

    try {
      const response = await axios.post(`${API_URL}Create.php`, addUser, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Server response:", response.data); // Log the server response

      if (response.data.status === "success") {
        setAddUser({
          UserName: "",
          Password: "",
          UserType: "",
          Email: "",
        });
        closeAddUserModal();
        // Refresh users data
        const updatedUsers = await axios.get(`${API_URL}Read.php`);
        setUsers(updatedUsers.data);
      } else {
        // Handle error response
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Failed to add user", error);
    }
  };

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
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Delete Confirmation</h5>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <p className="mt-4">Are you sure you want to delete this user?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeDeleteModal}
                className="text-gray-500 hover:text-gray-700 mr-4"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-4 py-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">User Details</h5>
              <button
                type="button"
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="mt-4">
              <p>User ID: {currentItem?.UserId}</p>
              <p>User Name: {currentItem?.UserName}</p>
              <p>Email: {currentItem?.Email}</p>
              <p>User Type: {currentItem?.UserType}</p>
              <p>Created Date: {currentItem?.CreatedDate}</p>
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
                      name="UserName"
                      value={addUser.UserName}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                      placeholder="User Name"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      name="Password"
                      value={addUser.Password}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                      placeholder="Password"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      name="Email"
                      value={addUser.Email}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                      placeholder="Email"
                    />
                  </div>
                  <div className="relative">
                    <select
                      name="UserType"
                      value={addUser.UserType}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                    >
                      <option value="">Select User Type</option>
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
