import React, { useEffect, useState } from "react";
import { fetchData } from "../utilities/ApiUti";

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
    setCurrentItem(user);
    setModals((prevModals) => ({
      ...prevModals,
      [modalType]: !prevModals[modalType],
    }));

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

  const fetchUsers = async () => {
    try {
      const result = await fetchData(`${API_URL}GetUsers`, "GET");
      setUsers(result);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await fetchData(`${API_URL}CreateUser`, "POST", {
        userId: 0,
        userName: addUser.userName,
        password: addUser.password,
        userType: addUser.userType,
        email: addUser.email,
        token: "1234", // Include the token
      });
      toggleModal("add");
      fetchUsers(); // Refresh user list after adding
    } catch (error) {
      console.error("Failed to add user", error);
    }
  };

  const handleDeleteUser = async () => {
    if (currentItem && currentItem.userId) {
      try {
        await fetchData(
          `${API_URL}DeleteUser?UserId=${currentItem.userId}`,
          "DELETE"
        );
        toggleModal("delete");
        fetchUsers();
      } catch (error) {
        console.error("Failed to delete user", error);
        alert(`Failed to delete user. Error: ${error.message}`);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddUser({ ...addUser, [name]: value });
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await fetchData(
        `${API_URL}UpdateUser?UserId=${currentItem.userId}`,
        "PUT",
        {
          userId: currentItem.userId,
          userName: addUser.userName,
          password: addUser.password,
          userType: addUser.userType,
          email: addUser.email,
          token: "1234",
        }
      );
      toggleModal("update");
      fetchUsers(); // Refresh user list after updating
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user. Please try again.");
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
                    <th className="column3">Email</th>
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
                      <td className="column3">{user.email}</td>
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
                          onClick={() => toggleModal("delete", user)}
                          type="button"
                          className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                        <button
                          onClick={() => toggleModal("view", user)}
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

      {modals.update && currentItem && (
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
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => toggleModal("update")}
                  className="text-gray-600 hover:text-gray-800 me-4"
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
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => toggleModal("add")}
                  className="text-gray-600 hover:text-gray-800 me-4"
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
            <p>Are you sure you want to delete this user?</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => toggleModal("delete")}
                className="text-gray-600 hover:text-gray-800 me-4"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                type="button"
                className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-4 py-2"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {modals.view && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">View User Details</h5>
              <button
                type="button"
                onClick={() => toggleModal("view")}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <p>User Name: {currentItem.userName}</p>
            <p>Email: {currentItem.email}</p>
            <p>User Type: {currentItem.userType}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => toggleModal("view")}
                className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
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
