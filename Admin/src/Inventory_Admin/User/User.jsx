"use client"

import { useEffect, useState } from "react"
import { fetchData } from "../utilities/ApiUti"
import { toast } from "react-toastify"
import "./CSS/modal.css"

// const API_URL = "https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net"
const API_URL = "http://localhost:5075"
export default function Users() {
  const [modals, setModals] = useState({
    add: false,
    update: false,
    delete: false,
    view: false,
  })
  const [currentItem, setCurrentItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [userTypeQuery, setUserTypeQuery] = useState("")
  const [users, setUsers] = useState([])

  const [addUser, setAddUser] = useState({
    userName: "",
    password: "",
    userType: "",
    email: "",
    name: "", // Added name
    department: "", // Added department
    categoryViewID: 0, // Add default value
  })

  const toggleModal = (modalType, user = null) => {
    setCurrentItem(user)
    setModals((prevModals) => ({
      ...prevModals,
      [modalType]: !prevModals[modalType],
    }))

    if (modalType === "update" && user) {
      setAddUser({
        userName: user.userName,
        password: user.password,
        userType: user.userType,
        email: user.email,
        name: user.name, // Pre-fill name
        department: user.department, // Pre-fill department
      })
    } else if (modalType === "add") {
      setAddUser({
        userName: "",
        password: "",
        userType: "",
        email: "",
        name: "", // Clear name
        department: "", // Clear department
        categoryViewID: 0,
      })
    }
  }

  const fetchUsers = async () => {
    try {
      const result = await fetchData(`${API_URL}/api/UsersApi/GetUsers`, "GET")
      setUsers(result)
    } catch (error) {
      console.error("Failed to fetch users", error)
    }
  }
  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      await fetchData(`${API_URL}/api/UsersApi/CreateUser`, "POST", {
        userId: 0,
        userName: addUser.userName,
        password: addUser.password,
        userType: addUser.userType,
        email: addUser.email,
        name: addUser.name,
        department: addUser.department,
        categoryViewID: addUser.userType === "Teacher" ? 1 : 0, // Set CategoryViewID based on userType
      })
      toggleModal("add")
      toast.success(`Added User successfully!`)
      fetchUsers() // Refresh user list after adding
    } catch (error) {
      console.error("Failed to add user", error)
    }
  }

  const handleDeleteUser = async () => {
    if (currentItem && currentItem.userId) {
      try {
        await fetchData(`${API_URL}/api/UsersApi/DeleteUser?UserId=${currentItem.userId}`, "DELETE")
        toggleModal("delete")
        toast.error(`Delete User ${currentItem.userId} Succesfully`)
        fetchUsers()
      } catch (error) {
        console.error("Failed to delete user", error)
        alert(`Failed to delete user. Error: ${error.message}`)
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const updatedUser = { ...addUser, [name]: value }

    // Set CategoryViewID to 1 when userType is Teacher
    if (name === "userType" && value === "Teacher") {
      updatedUser.categoryViewID = 1
    }

    setAddUser(updatedUser)
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    try {
      await fetchData(`${API_URL}/api/UsersApi/UpdateUser?UserId=${currentItem.userId}`, "PUT", {
        userId: currentItem.userId,
        userName: addUser.userName,
        password: addUser.password,
        userType: addUser.userType,
        email: addUser.email,
        name: addUser.name, // Include name
        department: addUser.department, // Include department
      })
      toggleModal("update")
      toast.success(`Information Updated Succesfully`)
      fetchUsers() // Refresh user list after updating
    } catch (error) {
      console.error("Failed to update user:", error)
      alert("Failed to update user. Please try again.")
    }
  }
  const filteredUsers = users.filter((user) => {
    const userName = user.userName ? user.userName.toLowerCase() : ""
    return userName.includes(searchQuery.toLowerCase()) && (userTypeQuery === "" || user.userType === userTypeQuery)
  })

  return (
    <>
      <div className="limiter w-full bg-gray-100 min-h-screen p-6">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-4xl font-bold text-gray-700">User List</h2>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex flex-wrap gap-4 justify-between items-center">
            <input
              type="text"
              placeholder="Search by User Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-3 border rounded border-gray-300 focus:outline-none focus:ring focus:ring-blue-200"
            />
            <select
              value={userTypeQuery}
              onChange={(e) => setUserTypeQuery(e.target.value)}
              className="p-3 border rounded border-gray-300 focus:outline-none focus:ring focus:ring-blue-200"
            >
              <option value="">All User Types</option>
              <option value="Inventory_Admin">Inventory Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Department">Department</option>
              <option value="Asset_Admin">Asset Admin</option>
              <option value="School_Admin">School Admin</option>
            </select>
            <button
              onClick={() => toggleModal("add")}
              className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2 shadow-md"
            >
              <i className="fa-solid fa-plus"></i> Add User
            </button>
          </div>

          {/* User Table */}
          <table className="min-w-full border-collapse border border-gray-200 bg-white">
            <thead className="bg-gray-200">
              <tr className="font-semibold text-md text-white">
                <th className="border border-gray-300 px-5 py-3">Profile Picture</th>
                <th className="border border-gray-300 px-5 py-3">Name</th>

                <th className="border border-gray-300 px-5 py-3">Department</th>
                <th className="border border-gray-300 px-5 py-3">User Name</th>
                <th className="border border-gray-300 px-5 py-3">Email</th>
                <th className="border border-gray-300 px-5 py-3">User Type</th>
                <th className="border border-gray-300 px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-5 py-3 text-center">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture || "/placeholder.svg"}
                        alt={`${user.name}'s profile`}
                        className="w-12 h-12 rounded-full mx-auto object-cover border-2 border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium text-lg shadow-sm">
                        {user.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()
                          : user.userName?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </td>

                  {/* Name Column */}
                  <td className="border border-gray-300 px-5 py-3">{user.name}</td>

                  {/* Profile Picture Column */}

                  {/* Other Columns */}
                  <td className="border border-gray-300 px-5 py-3">{user.department}</td>
                  <td className="border border-gray-300 px-5 py-3">{user.userName}</td>
                  <td className="border border-gray-300 px-5 py-3">{user.email}</td>
                  <td className="border border-gray-300 px-5 py-3">{user.userType}</td>

                  {/* Actions Column */}
                  <td className="border border-gray-300 px-5 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleModal("update", user)}
                      className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5 shadow-md"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      onClick={() => toggleModal("delete", user)}
                      type="button"
                      className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-3 py-1.5 shadow-md ml-2"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                    <button
                      onClick={() => toggleModal("view", user)}
                      type="button"
                      className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 shadow-md ml-2"
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

      {modals.update && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Edit User</h2>
              <button
                onClick={() => toggleModal("update")}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close Modal"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <form onSubmit={handleEditUser}>
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-3">
                  {currentItem.profilePicture ? (
                    <img
                      src={currentItem.profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xl shadow-sm">
                      {currentItem.name
                        ? currentItem.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()
                        : currentItem.userName?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <label
                  htmlFor="profile-picture-upload"
                  className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                >
                  Change Profile Picture
                  <input id="profile-picture-upload" type="file" className="hidden" accept="image/*" />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-user fa-lg text-blue-500"></i>
                  <div className="flex-1">
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={addUser.name}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-building fa-lg text-green-500"></i>
                  <div className="flex-1">
                    <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <input
                      type="text"
                      id="edit-department"
                      name="department"
                      value={addUser.department}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-id-badge fa-lg text-yellow-500"></i>
                  <div className="flex-1">
                    <label htmlFor="edit-userName" className="block text-sm font-medium text-gray-700">
                      User Name
                    </label>
                    <input
                      type="text"
                      id="edit-userName"
                      name="userName"
                      value={addUser.userName}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-lock fa-lg text-red-500"></i>
                  <div className="flex-1">
                    <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      id="edit-password"
                      name="password"
                      value={addUser.password}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-envelope fa-lg text-purple-500"></i>
                  <div className="flex-1">
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="edit-email"
                      name="email"
                      value={addUser.email}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-user-shield fa-lg text-teal-500"></i>
                  <div className="flex-1">
                    <label htmlFor="edit-userType" className="block text-sm font-medium text-gray-700">
                      User Type
                    </label>
                    <select
                      id="edit-userType"
                      name="userType"
                      value={addUser.userType}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      <option value="">Select User Type</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Department">Department</option>
                      <option value="Inventory_Admin">Inventory Admin</option>
                      <option value="Asset_Admin">Asset Admin</option>
                      <option value="School_Admin">School Admin</option>
                      <option value="Head_Admin">Head Admin</option>
                      {/* <option value="Asset_Admin">Asset Admin</option> */}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => toggleModal("update")} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modals.add && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Add User</h2>
              <button
                onClick={() => toggleModal("add")}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close Modal"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-3">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xl shadow-sm">
                    <i className="fa-solid fa-user fa-lg"></i>
                  </div>
                </div>
                <label
                  htmlFor="add-profile-picture"
                  className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                >
                  Upload Profile Picture
                  <input id="add-profile-picture" type="file" className="hidden" accept="image/*" />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-user fa-lg text-blue-500"></i>
                  <div className="flex-1">
                    <label htmlFor="add-name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="add-name"
                      name="name"
                      value={addUser.name}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter Name"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-building fa-lg text-green-500"></i>
                  <div className="flex-1">
                    <label htmlFor="add-department" className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <input
                      type="text"
                      id="add-department"
                      name="department"
                      value={addUser.department}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter Department"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-id-badge fa-lg text-yellow-500"></i>
                  <div className="flex-1">
                    <label htmlFor="add-userName" className="block text-sm font-medium text-gray-700">
                      User Name
                    </label>
                    <input
                      type="text"
                      id="add-userName"
                      name="userName"
                      value={addUser.userName}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Enter User Name"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-lock fa-lg text-red-500"></i>
                  <div className="flex-1">
                    <label htmlFor="add-password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      id="add-password"
                      name="password"
                      value={addUser.password}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter Password"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-envelope fa-lg text-purple-500"></i>
                  <div className="flex-1">
                    <label htmlFor="add-email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="add-email"
                      name="email"
                      value={addUser.email}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter Email"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-user-shield fa-lg text-teal-500"></i>
                  <div className="flex-1">
                    <label htmlFor="add-userType" className="block text-sm font-medium text-gray-700">
                      User Type
                    </label>
                    <select
                      id="add-userType"
                      name="userType"
                      value={addUser.userType}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      <option value="">Select User Type</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Department">Department</option>
                      <option value="Inventory_Admin">Inventory Admin</option>
                      <option value="School_Admin">School Admin</option>
                      <option value="Head_Admin">Head Admin</option>
                      <option value="Asset_Admin">Asset Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => toggleModal("add")} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modals.delete && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Delete User</h2>
              <button onClick={() => toggleModal("delete")} className="text-gray-500 hover:text-gray-700">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this user?</p>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => toggleModal("delete")} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteUser} type="button" className="btn-danger">
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {modals.view && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full mx-4 p-8 md:mx-0">
            <div className="flex justify-between items-center border-b pb-4">
              <h5 className="text-xl font-bold text-gray-800">User Details</h5>
              <button
                type="button"
                onClick={() => toggleModal("view")}
                className="text-gray-400 hover:text-gray-600 transition"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark fa-lg"></i>
              </button>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="col-span-1 md:col-span-2 flex justify-center mb-4">
                {currentItem.profilePicture ? (
                  <img
                    src={currentItem.profilePicture || "/placeholder.svg"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-3xl shadow-md">
                    {currentItem.name
                      ? currentItem.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : currentItem.userName?.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-user fa-lg text-blue-500"></i>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg font-semibold text-gray-800">{currentItem.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-building fa-lg text-green-500"></i>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="text-lg font-semibold text-gray-800">{currentItem.department}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-id-badge fa-lg text-yellow-500"></i>
                <div>
                  <p className="text-sm text-gray-500">User Name</p>
                  <p className="text-lg font-semibold text-gray-800">{currentItem.userName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-envelope fa-lg text-red-500"></i>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-semibold text-gray-800">{currentItem.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-user-shield fa-lg text-purple-500"></i>
                <div>
                  <p className="text-sm text-gray-500">User Type</p>
                  <p className="text-lg font-semibold text-gray-800">{currentItem.userType}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => toggleModal("view")}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
