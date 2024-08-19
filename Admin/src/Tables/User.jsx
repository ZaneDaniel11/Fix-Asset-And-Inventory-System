import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5075/api/UsersApi/";

export default function Users() {
  const [modals, setModals] = useState({
    add: false,
    update: false,
    delete: false,
    view: false,
  });
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeQuery, setUserTypeQuery] = useState("");
  const [users, setUsers] = useState([]);

  const [addUser, setAddUser] = useState({
    userName: "",
    password: "",
    userType: "",
    email: "",
  });

  const toggleModal = (modalType, user = null) => {
    setModals((prevModals) => ({
      ...prevModals,
      [modalType]: !prevModals[modalType],
    }));
    setCurrentItem(user);

    if (modalType === "update" && user) {
      setAddUser({
        userName: user.userName,
        password: user.password,
        userType: user.userType,
        email: user.email,
      });
    } else if (modalType === "add") {
      setAddUser({
        userName: "",
        password: "",
        userType: "",
        email: "",
      });
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}GetUsers`);
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async () => {
    if (currentItem && currentItem.userId) {
      try {
        const response = await axios.delete(`${API_URL}DeleteUser`, {
          params: { UserId: currentItem.userId },
        });
        if (response.data.success) {
          setUsers(users.filter((user) => user.userId !== currentItem.userId));
          toggleModal("delete");
        }
      } catch (error) {
        console.error("Failed to delete user", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddUser({ ...addUser, [name]: value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}CreateUser`, addUser, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data) {
        setUsers([...users, response.data]);
        toggleModal("add");
      }
    } catch (error) {
      console.error("Failed to add user", error);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (currentItem && currentItem.userId) {
      try {
        const response = await axios.put(`${API_URL}UpdateUser`, currentItem, {
          params: { UserId: currentItem.userId },
        });
        if (response.data) {
          setUsers(
            users.map((user) =>
              user.userId === currentItem.userId ? response.data : user
            )
          );
          toggleModal("update");
        }
      } catch (error) {
        console.error("Failed to edit user", error);
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const userName = user.userName ? user.userName.toLowerCase() : "";
    return (
      userName.includes(searchQuery.toLowerCase()) &&
      (userTypeQuery === "" || user.userType === userTypeQuery)
    );
  });

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
                  onClick={() => toggleModal("add")}
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
                    <tr key={user.userId}>
                      <td className="column1">{user.userId}</td>
                      <td className="column2">{user.userName}</td>
                      <td className="column3">{user.password}</td>
                      <td className="column5">{user.createdDate}</td>
                      <td className="column6">{user.userType}</td>
                      <td className="column6">
                        <button
                          type="button"
                          onClick={() => toggleModal("update", user)}
                          className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => {
                            setCurrentItem(user);
                            toggleModal("delete");
                          }}
                          type="button"
                          className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>

                        <button
                          onClick={() => {
                            setCurrentItem(user);
                            toggleModal("view");
                          }}
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

      {modals.update && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Edit User</h5>
              <button
                type="button"
                onClick={() => toggleModal("update")}
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
                      name="userName"
                      value={addUser.userName}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                      placeholder="User Name"
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
                      name="userType"
                      value={addUser.userType}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => toggleModal("update")}
                  className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2 ml-4"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modals.add && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Add User</h5>
              <button
                type="button"
                onClick={() => toggleModal("add")}
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
                      name="userName"
                      value={addUser.userName}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                      placeholder="User Name"
                      required
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
                      required
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
                      required
                    />
                  </div>
                  <div className="relative">
                    <select
                      name="userType"
                      value={addUser.userType}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                      required
                    >
                      <option value="">Select User Type</option>
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => toggleModal("add")}
                  className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2 ml-4"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modals.delete && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Delete User</h5>
              <button
                type="button"
                onClick={() => toggleModal("delete")}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <p className="mt-4">Are you sure you want to delete this user?</p>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => toggleModal("delete")}
                className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("Deleting user:", currentItem); // Debugging line
                  handleDeleteUser();
                }}
                className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-4 py-2 ml-4"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {modals.view && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">View User</h5>
              <button
                type="button"
                onClick={() => toggleModal("view")}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="mt-4">
              <p>
                <strong>User ID:</strong> {currentItem.userId}
              </p>
              <p>
                <strong>User Name:</strong> {currentItem.userName}
              </p>
              <p>
                <strong>Email:</strong> {currentItem.email}
              </p>
              <p>
                <strong>User Type:</strong> {currentItem.userType}
              </p>
              <p>
                <strong>Created Date:</strong> {currentItem.createdDate}
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => toggleModal("view")}
                className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
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
