"use client"

import { useState, useEffect } from "react"

export default function Admin1Logs() {
  const [viewRequestModalOpen, setViewRequestModalOpen] = useState(false)
  const [viewBorrowModalOpen, setViewBorrowModalOpen] = useState(false)
  const [viewMaintenanceModalOpen, setViewMaintenanceModalOpen] = useState(false) // Added for maintenance view
  const [currentItem, setCurrentItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [requestItems, setRequestItems] = useState([])
  const [borrowRequests, setBorrowRequests] = useState([])
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [borrowedItems, setBorrowedItems] = useState([])
  const [borrowLoading, setBorrowLoading] = useState(false)
  const [selectedTable, setSelectedTable] = useState("requestItems")
  const [editModalOpen, setEditModalOpen] = useState(false) // Added for edit modals
  const [editRequestModalOpen, setEditRequestModalOpen] = useState(false) // Added for request edit

  // Fetch approved borrow requests (initial load)
  useEffect(() => {
    const fetchApprovedBorrowRequests = async () => {
      try {
        const response = await fetch(
          "https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/ApprovedByAdmin1",
        )
        const data = await response.json()
        setBorrowRequests(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchApprovedBorrowRequests()
    fetchRequestItems() // Add this line to load request items on initial render
  }, [])

  const fetchRequestItems = async () => {
    try {
      setLoading(true)
      fetch(
        "https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/RequestItemsApi/GetAllRequests",
      )
        .then((response) => response.json())
        .then((data) => {
          const mappedItems = data.map((item) => ({
            id: item.requestID,
            requestID: item.requestID,
            name: item.requestedItem,
            requestedBy: item.requestedBy,
            requestedDate: item.requestedDate,
            status: item.status,
            priority: item.priority,
            Admin1: item.admin1Approval,
            Admin2: item.admin2Approval,
            Admin3: item.admin3Approval,
          }))
          setRequestItems(mappedItems)
        })
        .catch((error) => console.error("Error fetching data:", error))
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchBorrowRequests = async () => {
    try {
      setLoading(true)
      fetch(
        "https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/GetAllBorrowRequests",
      )
        .then((response) => response.json())
        .then((data) => {
          const mappedItems = data.map((item) => ({
            BorrowId: item.BorrowId,
            RequestedBy: item.RequestedBy,
            ReqBorrowDate: new Date(item.ReqBorrowDate).toLocaleString(),
            Purpose: item.Purpose,
            Status: item.Status,
            Admin1Approval: item.Admin1Approval,
            Admin2Approval: item.Admin2Approval,
            Admin3Approval: item.Admin3Approval,
          }))
          setBorrowRequests(mappedItems)
          console.log(mappedItems)
        })
        .catch((error) => console.error("Error fetching data:", error))
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMaintenanceLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        "https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/MaintenanceApi/GetAllMaintenanceRequest",
      )
      const data = await response.json()
      const mappedLogs = data.map((log) => ({
        id: log.maintenanceID,
        name: log.assetName,
        requestedBy: log.requestedBy,
        requestedDate: new Date(log.requestDate).toLocaleString(),
        status: log.approvalStatus,
        Admin2: log.approvedByAdmin2,
        Admin1: log.approvedByAdmin1,
        issue: log.issue,
        description: log.description,
        location: log.location,
      }))
      setMaintenanceLogs(mappedLogs)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const openViewRequestModal = (item) => {
    setCurrentItem(item)
    setViewRequestModalOpen(true)
  }

  const openViewBorrowModal = async (item) => {
    setCurrentItem(item)
    setViewBorrowModalOpen(true)
    setBorrowLoading(true)

    try {
      const response = await fetch(
        `https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/ViewRequest/${item.BorrowId}`,
      )
      const data = await response.json()
      setBorrowedItems(data)
    } catch (error) {
      console.error("Error fetching borrowed items:", error)
    } finally {
      setBorrowLoading(false)
    }
  }

  // Added missing function definitions
  const openViewModal = (item) => {
    setCurrentItem(item)
    setViewMaintenanceModalOpen(true)
  }

  const openEditRequestModal = (item) => {
    setCurrentItem(item)
    setEditRequestModalOpen(true)
  }

  const openEditModal = (item) => {
    setCurrentItem(item)
    setEditModalOpen(true)
  }

  const handleTableChange = (table) => {
    setSelectedTable(table)
    if (table === "requestItems") {
      fetchRequestItems()
    } else if (table === "borrowRequests") {
      fetchBorrowRequests()
    } else if (table === "maintenanceLogs") {
      fetchMaintenanceLogs()
    }
  }

  const filteredItems = requestItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (item.Admin3 === "Approved" || item.Admin3 === "Declined") &&
      item.Admin2 === "Approved",
  )

  const filteredItemsMaintenace = maintenanceLogs.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (item.Admin2 === "Approved" || item.Admin2 === "Declined") &&
      item.Admin1 === "Approved",
  )

  if (loading) {
    return <div>Loading data...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <>
      <div className="flex-1 p-6">
        <div className="container mx-auto bg-white shadow-md rounded-lg p-6">
          <div className="bg-gray-200 p-4 shadow-lg rounded-lg mb-6 text-center">
            <h2 className="text-2xl font-bold">Overview</h2>
          </div>

          <div className="flex justify-between  shadow-lg p-6 bg-white rounded-lg mb-6">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-3 border rounded-lg shadow-sm border-gray-300"
            />
          </div>

          <div>
            <button
              onClick={() => handleTableChange("requestItems")}
              className={`px-4 py-2 font-bold ${
                selectedTable === "requestItems" ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
            >
              Request Item
            </button>

            <button
              onClick={() => handleTableChange("borrowRequests")}
              className={`px-4 py-2 font-bold ${
                selectedTable === "borrowRequests" ? "bg-blue-500 text-white" : "bg-gray-300"
              } ml-4`}
            >
              Borrow Request
            </button>

            <button
              onClick={() => handleTableChange("maintenanceLogs")}
              className={`px-4 py-2 font-bold ${
                selectedTable === "maintenanceLogs" ? "bg-blue-500 text-white" : "bg-gray-300"
              } ml-4`}
            >
              Maintenance Logs
            </button>
          </div>

          {selectedTable === "requestItems" && (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full border-collapse border border-gray-200 bg-white">
                <thead className="bg-gray-200">
                  <tr className="font-semibold text-md text-zinc-50">
                    <th className="border border-gray-300 px-5 py-3">Request ID</th>
                    <th className="border border-gray-300 px-5 py-3">Item Name</th>
                    <th className="border border-gray-300 px-5 py-3">Requested By</th>
                    <th className="border border-gray-300 px-5 py-3">Requested Date</th>
                    <th className="border border-gray-300 px-5 py-3">Status</th>
                    <th className="border border-gray-300 px-5 py-3">Priority</th>
                    <th className="border border-gray-300 px-5 py-3">Inventory Admin</th>
                    <th className="border border-gray-300 px-5 py-3">Admin2</th>
                    <th className="border border-gray-300 px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition duration-200`}
                    >
                      <td className="border border-gray-300 px-5 py-3">{item.requestID}</td>
                      <td className="border border-gray-300 px-5 py-3">{item.name}</td>
                      <td className="border border-gray-300 px-5 py-3">{item.requestedBy}</td>
                      <td className="border border-gray-300 px-5 py-3">
                        {new Date(item.requestedDate).toLocaleDateString()}
                      </td>
                      <td
                        className={`border border-gray-300 px-4 py-2 font-medium ${
                          item.status === "Pending"
                            ? "text-yellow-600"
                            : item.status === "Rejected"
                              ? "text-red-600"
                              : item.status === "Approved"
                                ? "text-green-500"
                                : "text-blue-600"
                        }`}
                      >
                        <i
                          className={`fa ${
                            item.status === "Approved"
                              ? "fa-check-circle"
                              : item.status === "Rejected"
                                ? "fa-times-circle"
                                : item.status === "Pending"
                                  ? "fa-hourglass-half"
                                  : "fa-circle"
                          } mr-1`}
                        ></i>
                        {item.status}
                      </td>
                      <td className="border border-gray-300 px-5 py-3">{item.priority}</td>
                      <td
                        className={`border border-gray-300 px-5 py-3 ${
                          item.Admin1 === "Approved"
                            ? "text-green-500"
                            : item.Admin1 === "Rejected"
                              ? "text-red-500"
                              : item.Admin1 === "Pending"
                                ? "text-yellow-500"
                                : "text-gray-400"
                        }`}
                      >
                        <i
                          className={`fa ${
                            item.Admin1 === "Approved"
                              ? "fa-check-circle"
                              : item.Admin1 === "Rejected"
                                ? "fa-times-circle"
                                : item.Admin1 === "Pending"
                                  ? "fa-hourglass-half"
                                  : "fa-circle"
                          } mr-1`}
                        ></i>
                        {item.Admin1}
                      </td>
                      <td
                        className={`border border-gray-300 px-5 py-3 ${
                          item.Admin2 === "Approved"
                            ? "text-green-500"
                            : item.Admin2 === "Rejected"
                              ? "text-red-500"
                              : item.Admin2 === "Pending"
                                ? "text-yellow-500"
                                : item.Admin2 === "Declined"
                                  ? "text-red-500"
                                  : "text-gray-400"
                        }`}
                      >
                        <i
                          className={`fa ${
                            item.Admin2 === "Approved"
                              ? "fa-check-circle"
                              : item.Admin2 === "Rejected"
                                ? "fa-times-circle"
                                : item.Admin2 === "Pending"
                                  ? "fa-hourglass-half"
                                  : "fa-circle"
                          } mr-1`}
                        ></i>
                        {item.Admin2}
                      </td>
                      <td className="border border-gray-300 px-5 py-3 text-center">
                        <div className="flex items-center gap-4 justify-center">
                          <button
                            onClick={() => openViewRequestModal(item)}
                            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 transition duration-150"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEditRequestModal(item)}
                            className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-1.5"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {selectedTable === "borrowRequests" && (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full border-collapse border border-gray-200 bg-white">
                <thead className="bg-gray-200">
                  <tr className="font-semibold text-md text-zinc-50">
                    <th className="border border-gray-300 px-5 py-3">Borrow ID</th>
                    <th className="border border-gray-300 px-5 py-3">Requested By</th>
                    <th className="border border-gray-300 px-5 py-3">Requested Date</th>
                    <th className="border border-gray-300 px-5 py-3">Purpose</th>
                    <th className="border border-gray-300 px-5 py-3">Status</th>
                    <th className="border border-gray-300 px-5 py-3">Inventory</th>
                    <th className="border border-gray-300 px-5 py-3">Head Admin</th>
                    <th className="border border-gray-300 px-5 py-3">School Admin</th>
                    <th className="border border-gray-300 px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowRequests.map((item, index) => (
                    <tr
                      key={item.BorrowId}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition duration-200`}
                    >
                      <td className="border border-gray-300 px-5 py-3">{item.BorrowId}</td>
                      <td className="border border-gray-300 px-5 py-3">{item.RequestedBy}</td>
                      <td className="border border-gray-300 px-5 py-3">
                        {new Date(item.ReqBorrowDate).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-5 py-3">{item.Purpose}</td>
                      <td
                        className={`border border-gray-300 px-5 py-3 font-medium ${
                          item.Status === "Pending"
                            ? "text-yellow-600"
                            : item.Status === "Rejected"
                              ? "text-red-600"
                              : item.Status === "Approved"
                                ? "text-green-500"
                                : "text-blue-600"
                        }`}
                      >
                        {item.Status}
                      </td>
                      <td
                        className={`border border-gray-300 px-5 py-3 font-medium ${
                          item.Admin1Approval === "Approved"
                            ? "text-green-500"
                            : item.Admin1Approval === "Rejected"
                              ? "text-red-500"
                              : item.Admin1Approval === "Pending"
                                ? "text-yellow-500"
                                : "text-gray-400"
                        }`}
                      >
                        <i
                          className={`fa ${
                            item.Admin1Approval === "Approved"
                              ? "fa-check-circle"
                              : item.Admin1Approval === "Rejected"
                                ? "fa-times-circle"
                                : item.Admin1Approval === "Pending"
                                  ? "fa-hourglass-half"
                                  : "fa-circle"
                          } mr-1`}
                        ></i>
                        {item.Admin1Approval}
                      </td>
                      <td
                        className={`border border-gray-300 px-5 py-3 font-medium ${
                          item.Admin2Approval === "Approved"
                            ? "text-green-500"
                            : item.Admin2Approval === "Rejected"
                              ? "text-red-500"
                              : item.Admin2Approval === "Pending"
                                ? "text-yellow-500"
                                : item.Admin2Approval === "Declined"
                                  ? "text-red-500"
                                  : "text-gray-400"
                        }`}
                      >
                        <i
                          className={`fa ${
                            item.Admin2Approval === "Approved"
                              ? "fa-check-circle"
                              : item.Admin2Approval === "Rejected"
                                ? "fa-times-circle"
                                : item.Admin2Approval === "Pending"
                                  ? "fa-hourglass-half"
                                  : "fa-circle"
                          } mr-1`}
                        ></i>
                        {item.Admin2Approval}
                      </td>
                      <td
                        className={`border border-gray-300 px-5 py-3 font-medium ${
                          item.Admin3Approval === "Approved"
                            ? "text-green-500"
                            : item.Admin3Approval === "Rejected"
                              ? "text-red-500"
                              : item.Admin3Approval === "Pending"
                                ? "text-yellow-500"
                                : item.Admin3Approval === "Declined"
                                  ? "text-red-500"
                                  : "text-gray-400"
                        }`}
                      >
                        <i
                          className={`fa ${
                            item.Admin3Approval === "Approved"
                              ? "fa-check-circle"
                              : item.Admin3Approval === "Rejected"
                                ? "fa-times-circle"
                                : item.Admin3Approval === "Pending"
                                  ? "fa-hourglass-half"
                                  : "fa-circle"
                          } mr-1`}
                        ></i>
                        {item.Admin3Approval}
                      </td>
                      <td className="border border-gray-300 px-5 py-3 text-center">
                        <div className="flex items-center gap-4 justify-center">
                          <button
                            onClick={() => openViewBorrowModal(item)}
                            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 transition duration-150"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-3 py-1.5"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedTable === "maintenanceLogs" && (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full border-collapse border border-gray-200 bg-white">
                <thead className="bg-gray-200">
                  <tr className="font-semibold text-md text-zinc-50">
                    <th className="border border-gray-300 px-5 py-3">Request ID</th>
                    <th className="border border-gray-300 px-5 py-3">Asset Name</th>
                    <th className="border border-gray-300 px-5 py-3">Request Date</th>
                    <th className="border border-gray-300 px-5 py-3">Location</th>
                    <th className="border border-gray-300 px-5 py-3">Issue</th>
                    <th className="border border-gray-300 px-5 py-3">Status</th>
                    <th className="border border-gray-300 px-5 py-3">Inventory Admin</th>
                    <th className="border border-gray-300 px-5 py-3">Approval</th>
                    <th className="border border-gray-300 px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItemsMaintenace.map((log, index) => (
                    <tr
                      key={log.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition duration-200`}
                    >
                      <td className="border border-gray-300 px-5 py-3">{log.id}</td>
                      <td className="border border-gray-300 px-5 py-3">{log.name}</td>
                      <td className="border border-gray-300 px-5 py-3">
                        {new Date(log.requestedDate).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-5 py-3">{log.location}</td>
                      <td className="border border-gray-300 px-5 py-3">{log.issue}</td>
                      <td
                        className={`border border-gray-300 px-4 py-2 font-medium ${
                          log.status === "Pending"
                            ? "text-yellow-600"
                            : log.status === "Rejected"
                              ? "text-red-600"
                              : log.status === "Approved"
                                ? "text-green-500"
                                : "text-blue-600"
                        }`}
                      >
                        <i
                          className={`fa ${
                            log.status === "Approved"
                              ? "fa-check-circle"
                              : log.status === "Rejected"
                                ? "fa-times-circle"
                                : log.status === "Pending"
                                  ? "fa-hourglass-half"
                                  : "fa-circle"
                          } mr-1`}
                        ></i>
                        {log.status}
                      </td>
                      <td
                        className={`border border-gray-300 px-5 py-3 ${
                          log.Admin1 === "Pending"
                            ? "text-yellow-600"
                            : log.Admin1 === "Declined"
                              ? "text-red-600"
                              : log.Admin1 === "Approved"
                                ? "text-green-500"
                                : "text-blue-600"
                        }`}
                      >
                        <i
                          className={`fa ${
                            log.Admin1 === "Approved"
                              ? "fa-check-circle"
                              : log.Admin1 === "Rejected"
                                ? "fa-times-circle"
                                : log.Admin1 === "Pending"
                                  ? "fa-hourglass-half"
                                  : "fa-circle"
                          } mr-1`}
                        ></i>
                        {log.Admin1}
                      </td>
                      <td
                        className={`border border-gray-300 px-5 py-3 ${
                          log.Admin2 === "Pending"
                            ? "text-yellow-600"
                            : log.Admin2 === "Declined"
                              ? "text-red-600"
                              : log.Admin2 === "Approved"
                                ? "text-green-500"
                                : "text-blue-600"
                        }`}
                      >
                        <i
                          className={`fa ${
                            log.Admin2 === "Approved"
                              ? "fa-check-circle"
                              : log.Admin2 === "Rejected"
                                ? "fa-times-circle"
                                : log.Admin2 === "Pending"
                                  ? "fa-hourglass-half"
                                  : "fa-circle"
                          } mr-1`}
                        ></i>
                        {log.Admin2}
                      </td>
                      <td className="border border-gray-300 px-5 py-3 text-center">
                        <div className="flex items-center gap-4 justify-center">
                          <button
                            onClick={() => openViewModal(log)}
                            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 transition duration-150"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Modal for Request Items */}
      {viewRequestModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-3/4 max-w-5xl p-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-file-alt text-blue-600"></i> Request Details
              </h3>
              <button
                onClick={() => setViewRequestModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <i className="fa-solid fa-times text-2xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-id-card text-blue-500"></i>
                  <span>
                    <strong>ID:</strong> {currentItem.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-user text-blue-500"></i>
                  <span>
                    <strong>Requested By:</strong> {currentItem.requestedBy}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-calendar-day text-blue-500"></i>
                  <span>
                    <strong>Requested Date:</strong> {currentItem.requestedDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-box text-blue-500"></i>
                  <span>
                    <strong>Item Name:</strong> {currentItem.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-bullseye text-blue-500"></i>
                  <span>
                    <strong>Priority:</strong> {currentItem.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-layer-group text-blue-500"></i>
                  <span>
                    <strong>Status:</strong> {currentItem.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-user-check text-green-500"></i>
                  <span>
                    <strong>Admin1 Approval:</strong>{" "}
                    <span
                      className={
                        currentItem.Admin1 === "Approved"
                          ? "text-green-500"
                          : currentItem.Admin1 === "Pending"
                            ? "text-yellow-500"
                            : "text-red-500"
                      }
                    >
                      {currentItem.Admin1}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-user-check text-green-500"></i>
                  <span>
                    <strong>Admin2 Approval:</strong>{" "}
                    <span
                      className={
                        currentItem.Admin2 === "Approved"
                          ? "text-green-500"
                          : currentItem.Admin2 === "Pending"
                            ? "text-yellow-500"
                            : "text-red-500"
                      }
                    >
                      {currentItem.Admin2}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            {/* Modal Footer */}
            <div className="flex justify-end">
              <button
                onClick={() => setViewRequestModalOpen(false)}
                className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-200 flex items-center gap-2"
              >
                <i className="fa-solid fa-circle-xmark"></i> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal for Borrow Requests */}
      {viewBorrowModalOpen && currentItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-3/4 max-w-5xl p-8 overflow-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-box-archive text-blue-600"></i> Borrow Item Details
              </h3>
              <button
                onClick={() => setViewBorrowModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <i className="fa-solid fa-times text-2xl"></i>
              </button>
            </div>

            {/* Borrow Details */}
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-id-card text-blue-500"></i>
                  <span>
                    <strong>ID:</strong> {currentItem.BorrowId}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-user text-blue-500"></i>
                  <span>
                    <strong>Requested By:</strong> {currentItem.RequestedBy}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-calendar-day text-blue-500"></i>
                  <span>
                    <strong>Request Date:</strong> {currentItem.ReqBorrowDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-bullseye text-blue-500"></i>
                  <span>
                    <strong>Purpose:</strong> {currentItem.Purpose}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-info-circle text-blue-500"></i>
                  <span>
                    <strong>Status:</strong> {currentItem.Status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-user-check text-green-500"></i>
                <span>
                  <strong>Inventory Admin:</strong>{" "}
                  <span
                    className={
                      currentItem.Admin1Approval === "Approved"
                        ? "text-green-500"
                        : currentItem.Admin1Approval === "Pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                    }
                  >
                    {currentItem.Admin1Approval}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-user-check text-green-500"></i>
                <span>
                  <strong>Head Admin:</strong>{" "}
                  <span
                    className={
                      currentItem.Admin2Approval === "Approved"
                        ? "text-green-500"
                        : currentItem.Admin2Approval === "Pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                    }
                  >
                    {currentItem.Admin2Approval}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-user-check text-green-500"></i>
                <span>
                  <strong>School Admin:</strong>{" "}
                  <span
                    className={
                      currentItem.Admin3Approval === "Approved"
                        ? "text-green-500"
                        : currentItem.Admin3Approval === "Pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                    }
                  >
                    {currentItem.Admin3Approval}
                  </span>
                </span>
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            {/* Borrowed Items Section */}
            <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <i className="fa-solid fa-boxes-stacked text-green-600"></i> Borrowed Items
            </h4>
            <div className="overflow-y-auto max-h-[300px] space-y-4">
              {borrowLoading ? (
                <p>Loading borrowed items...</p>
              ) : (
                <ul>
                  {borrowedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-6 border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-lg transition-shadow duration-300 mb-3"
                    >
                      {/* Image Section */}
                      <img
                        src="https://via.placeholder.com/100"
                        alt={item.ItemName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      {/* Content Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{item.ItemName}</h3>
                        <p className="text-sm text-gray-600">
                          Quantity: <strong>{item.Quantity}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </ul>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setViewBorrowModalOpen(false)}
                className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-200 flex items-center gap-2"
              >
                <i className="fa-solid fa-circle-xmark"></i> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal for Maintenance Logs */}
      {viewMaintenanceModalOpen && currentItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-3/4 max-w-5xl p-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-wrench text-blue-600"></i> Maintenance Request Details
              </h3>
              <button
                onClick={() => setViewMaintenanceModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <i className="fa-solid fa-times text-2xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-id-card text-blue-500"></i>
                  <span>
                    <strong>ID:</strong> {currentItem.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-box text-blue-500"></i>
                  <span>
                    <strong>Asset Name:</strong> {currentItem.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-user text-blue-500"></i>
                  <span>
                    <strong>Requested By:</strong> {currentItem.requestedBy}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-calendar-day text-blue-500"></i>
                  <span>
                    <strong>Request Date:</strong> {currentItem.requestedDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-map-marker-alt text-blue-500"></i>
                  <span>
                    <strong>Location:</strong> {currentItem.location}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-exclamation-circle text-blue-500"></i>
                  <span>
                    <strong>Issue:</strong> {currentItem.issue}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">Description:</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {currentItem.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-user-check text-green-500"></i>
                  <span>
                    <strong>Inventory Admin Approval:</strong>{" "}
                    <span
                      className={
                        currentItem.Admin1 === "Approved"
                          ? "text-green-500"
                          : currentItem.Admin1 === "Pending"
                            ? "text-yellow-500"
                            : "text-red-500"
                      }
                    >
                      {currentItem.Admin1}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-user-check text-green-500"></i>
                  <span>
                    <strong>Head Admin Approval:</strong>{" "}
                    <span
                      className={
                        currentItem.Admin2 === "Approved"
                          ? "text-green-500"
                          : currentItem.Admin2 === "Pending"
                            ? "text-yellow-500"
                            : "text-red-500"
                      }
                    >
                      {currentItem.Admin2}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            {/* Modal Footer */}
            <div className="flex justify-end">
              <button
                onClick={() => setViewMaintenanceModalOpen(false)}
                className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-200 flex items-center gap-2"
              >
                <i className="fa-solid fa-circle-xmark"></i> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
