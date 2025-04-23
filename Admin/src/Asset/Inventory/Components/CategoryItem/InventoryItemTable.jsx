"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { QRCodeCanvas } from "qrcode.react"
import axios from "axios"
import { format } from "date-fns"
import {
  FaEye,
  FaPen,
  FaTrash,
  FaCalendarAlt,
  FaExchangeAlt,
  FaHistory,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSort,
  FaDownload,
} from "react-icons/fa"

// import { fetchData } from "../utilities/ApiUti";
const API_URL = "http://localhost:5075/api/AssetItemApi/"

export default function InventoryTable() {
  const location = useLocation()
  const qrRef = useRef(null)
  const navigate = useNavigate()
  const { selectedCategory } = location.state || {}
  const categoryId = selectedCategory?.categoryId
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" })
  const [transferData, setTransferData] = useState({
    newIssuedTo: "",
    newLocation: "",
  })
  const [modals, setModals] = useState({
    add: false,
    update: false,
    delete: false,
    view: false,
    addQuantity: false,
    viewDepreciation: false,
    transfer: false,
    viewHistory: false,
    confirmDelete: false,
    dispose: false, // Add this new state for the dispose modal
  })
  const [depreciationData, setDepreciationData] = useState(null)
  const [loadingDepreciation, setLoadingDepreciation] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [addItem, setAddItem] = useState({
    categoryID: "",
    AssetName: "",
    DatePurchased: "",
    DateIssued: "",
    IssuedTo: "",
    CheckedBy: "",
    AssetCost: 0,
    Location: "",
    AssetCode: "",
    Remarks: "",
    WarrantyStartDate: "",
    WarrantyExpirationDate: "",
    WarrantyVendor: "",
    WarrantyContact: "",
    AssetStatus: "",
    AssetType: "",
    AssetStype: "",
    PreventiveMaintenanceSchedule: "",
    DepreciationRate: "",
    DepreciationValue: "",
    DepreciationPeriodType: "month",
    DepreciationPeriodValue: 0,
  })
  const [disposeData, setDisposeData] = useState({
    assetId: 0,
    assetName: "",
    assetCode: "",
    assetCategory: "",
    disposalDate: new Date().toISOString().split("T")[0],
    reason: "Obsolete",
    originalValue: 0,
    disposalValue: 0,
    lossValue: 0,
  })

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch (error) {
      return "Invalid Date"
    }
  }

  // Calculate current asset value
  const calculateCurrentValue = (cost, rate, purchaseDate) => {
    if (!cost || !rate || !purchaseDate) return cost

    const purchase = new Date(purchaseDate)
    const today = new Date()
    const yearsElapsed = (today - purchase) / (1000 * 60 * 60 * 24 * 365)

    const depreciationAmount = (rate / 100) * cost * yearsElapsed
    return Math.max(1, (cost - depreciationAmount).toFixed(2))
  }

  // Toggle modal visibility
  const toggleModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: !prev[type] }))
  }

  // Fetch depreciation schedule
  const fetchDepreciationSchedule = async (assetId) => {
    setLoadingDepreciation(true)
    try {
      const response = await fetch(`${API_URL}ViewDepreciationSchedule?assetId=${assetId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch depreciation schedule")
      }
      const data = await response.json()
      setDepreciationData(data)
    } catch (error) {
      console.error("Error fetching depreciation schedule:", error)
      setDepreciationData(null)
    } finally {
      setLoadingDepreciation(false)
    }
  }

  // Open history modal
  const openHistoryModal = async (assetID) => {
    try {
      const response = await fetch(`http://localhost:5075/api/AssetHistoryApi/viewHistorical?assetID=${assetID}`)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      setHistoryData(data)
      toggleModal("viewHistory")
    } catch (error) {
      console.error("Error fetching history:", error)
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setAddItem((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number.parseFloat(value) : 0) : value,
    }))
  }

  // Fetch items on component mount
  useEffect(() => {
    if (!categoryId) {
      alert("No category selected, redirecting to categories page.")
      navigate("/categories")
    } else {
      fetchItems(categoryId)
    }
  }, [categoryId, navigate])

  // Fetch items from API
  const fetchItems = async (categoryId) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}GetAssetsByCategory?categoryID=${categoryId}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setItems(data)
      setFilteredItems(data)
    } catch (error) {
      console.error("Failed to fetch items", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredItems(items)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = items.filter(
        (item) =>
          (item.assetName && item.assetName.toLowerCase().includes(lowercasedSearch)) ||
          (item.assetCode && item.assetCode.toLowerCase().includes(lowercasedSearch)) ||
          (item.issuedTo && item.issuedTo.toLowerCase().includes(lowercasedSearch)) ||
          (item.assetLocation && item.assetLocation.toLowerCase().includes(lowercasedSearch)),
      )
      setFilteredItems(filtered)
    }
  }, [searchTerm, items])

  // Handle sorting
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })

    const sortedItems = [...filteredItems].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1
      }
      return 0
    })

    setFilteredItems(sortedItems)
  }

  // Generate asset code
  const generateAssetCode = () => {
    return `ASSET-${categoryId}-${Date.now()}`
  }

  // Convert QR canvas to base64
  const convertCanvasToBase64 = () => {
    const canvas = qrRef.current?.querySelector("canvas")
    return canvas ? canvas.toDataURL("image/png") : ""
  }

  // Handle view asset
  const handleViewAsset = (item) => {
    setSelectedItem(item)
    toggleModal("view")
  }

  // Toggle transfer modal
  const toggleTransferModal = () => {
    setModals((prev) => ({
      ...prev,
      transfer: !prev.transfer,
      view: false,
    }))
  }

  // Handle asset transfer
  const handleTransfer = async () => {
    const storedName = localStorage.getItem("name")

    if (!transferData.newIssuedTo || !transferData.newLocation) {
      alert("Please fill in all fields.")
      return
    }

    // Debug the selected item to see what properties are available
    console.log("Selected item for transfer:", selectedItem)

    // Prepare transfer data with proper property access
    // Note: Using optional chaining and fallbacks to prevent undefined errors
    const transferPayload = {
      AssetID: selectedItem.assetId,
      AssetCode: selectedItem.assetCode,
      AssetName: selectedItem.assetName,
      // Try multiple possible property names for category ID with fallbacks
      AssetCategoryID: selectedItem.categoryID || selectedItem.CategoryID || categoryId,
      NewOwner: transferData.newIssuedTo,
      NewLocation: transferData.newLocation,
      Remarks: transferData.remarks || selectedItem.remarks || "",
      PerformedBy: storedName,
    }

    try {
      console.log("📤 Sending Transfer Request:", transferPayload) // Log request payload

      const response = await axios.post("http://localhost:5075/api/AssetItemApi/TransferAsset", transferPayload, {
        headers: { "Content-Type": "application/json" },
      })

      console.log("✅ Transfer Response:", response.data) // Log successful response

      alert(response.data.Message || "Asset transferred successfully!")
      setModals((prev) => ({ ...prev, transfer: false }))
      fetchItems(categoryId)
    } catch (error) {
      console.error("❌ Error transferring asset:", error)

      if (error.response) {
        console.error("📩 Server Response:", error.response.data) // Log error response
        alert(`Transfer failed: ${error.response.data}`)
      } else {
        alert("Transfer failed. Please try again.")
      }
    }
  }

  // Handle delete asset
  const handleDeleteAsset = async () => {
    try {
      // Implement your delete API call here
      // await axios.delete(`${API_URL}DeleteAsset/${selectedItem.assetId}`);

      alert("Asset deleted successfully!")
      setModals((prev) => ({ ...prev, confirmDelete: false }))
      fetchItems(categoryId)
    } catch (error) {
      console.error("Error deleting asset:", error)
      alert("Delete failed.")
    }
  }

  // Handle add asset item
  const handleAddAssetItem = async (e) => {
    e.preventDefault()

    try {
      const generatedAssetCode = generateAssetCode()
      setQrData(generatedAssetCode)

      setTimeout(async () => {
        const qrCodeBase64 = convertCanvasToBase64()
        const formattedData = {
          assetQRCodeBase64: qrCodeBase64,
          categoryID: categoryId,
          assetName: addItem.AssetName,
          assetPicture: "images/assets/dell_latitude_5520.png",
          datePurchased: addItem.DatePurchased ? new Date(addItem.DatePurchased).toISOString() : null,
          dateIssued: addItem.DateIssued ? new Date(addItem.DateIssued).toISOString() : null,
          issuedTo: addItem.IssuedTo || "",
          checkedBy: addItem.CheckedBy || "",
          assetCost: Number.parseFloat(addItem.AssetCost) || 0,
          assetCode: generatedAssetCode,
          remarks: addItem.Remarks || "",
          assetLocation: addItem.Location || "",
          assetVendor: "Dell Technologies",
          warrantyStartDate: addItem.WarrantyStartDate ? new Date(addItem.WarrantyStartDate).toISOString() : null,
          warrantyExpirationDate: "2026-05-15T00:00:00.000Z",
          warrantyVendor: addItem.WarrantyVendor || "",
          warrantyContact: addItem.WarrantyContact || "",
          assetStatus: addItem.AssetStatus || "Active",
          assetStype: addItem.AssetStype || "Electronics",
          preventiveMaintenanceSchedule: "2025-02-02T13:23:09.541Z",
          notes: "",
          operationStartDate: "2023-06-01T14:00:00.000Z",
          operationEndDate: "2028-06-01T14:00:00.000Z",
          disposalDate: "2030-06-01T14:00:00.000Z",
          depreciationRate: 10,
          depreciationValue: 0,
          depreciationPeriodType: addItem.DepreciationPeriodType || "year",
          depreciationPeriodValue: Number.parseInt(addItem.DepreciationPeriodValue, 10) || 1,
          assetPreventiveMaintenace: "Quarterly",
        }

        const response = await axios.post(`${API_URL}InsertAsset`, formattedData, {
          headers: { "Content-Type": "application/json" },
        })

        toggleModal("add")
        fetchItems(categoryId)
      }, 500)
    } catch (error) {
      console.error("Failed to add asset item", error)
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "In Use":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Disposed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Add a function to handle disposal
  const handleDispose = async () => {
    try {
      // Extract categoryID from the assetCategory string or use the categoryId from the selected category
      let categoryID = categoryId
      if (disposeData.assetCategory && disposeData.assetCategory.includes("ID:")) {
        const match = disposeData.assetCategory.match(/ID:\s*(\d+)/)
        if (match && match[1]) {
          categoryID = Number.parseInt(match[1], 10)
        }
      }

      // Format the request body according to the API requirements
      const requestBody = {
        assetID: disposeData.assetId,
        categoryID: categoryID,
        assetName: disposeData.assetName,
        assetCode: disposeData.assetCode,
        disposalDate: new Date(disposeData.disposalDate).toISOString(),
        disposalReason: disposeData.reason,
        originalValue: Number.parseFloat(disposeData.originalValue),
        disposedValue: Number.parseFloat(disposeData.disposalValue), // Note: API expects disposedValue not disposalValue
        lossValue: Number.parseFloat(disposeData.lossValue),
      }

      console.log("Disposing asset with data:", requestBody)

      // Make the API call to dispose the asset
      const response = await axios.post("http://localhost:5075/api/AssetItemApi/DisposeAsset", requestBody, {
        headers: { "Content-Type": "application/json" },
      })

      console.log("Disposal response:", response.data)
      alert("Asset disposed successfully!")
      toggleModal("dispose")

      // Refresh the asset list
      fetchItems(categoryId)
    } catch (error) {
      console.error("Error disposing asset:", error)
      if (error.response) {
        console.error("Server response:", error.response.data)
        alert(`Failed to dispose asset: ${error.response.data}`)
      } else {
        alert("Failed to dispose asset. Please try again.")
      }
    }
  }

  // Add a function to open the dispose modal
  const openDisposeModal = (item) => {
    // Pre-fill the dispose data with the selected item's information
    setDisposeData({
      assetId: item.assetId || 0,
      assetName: item.assetName || "",
      assetCode: item.assetCode || "",
      assetCategory: `${item.categoryName || ""} (ID: ${item.categoryID || categoryId})`,
      disposalDate: new Date().toISOString().split("T")[0],
      reason: "Obsolete",
      originalValue: item.assetCost || 0,
      disposalValue: 0,
      lossValue: item.assetCost || 0,
    })

    toggleModal("view") // Close the view modal
    toggleModal("dispose") // Open the dispose modal
  }

  // Add a function to calculate loss value
  const calculateLossValue = (originalValue, disposalValue) => {
    return Math.max(0, originalValue - disposalValue)
  }

  // Add a function to handle disposal value change
  const handleDisposalValueChange = (value) => {
    const disposalValue = Number.parseFloat(value) || 0
    const originalValue = Number.parseFloat(disposeData.originalValue) || 0

    setDisposeData({
      ...disposeData,
      disposalValue,
      lossValue: calculateLossValue(originalValue, disposalValue),
    })
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedCategory?.categoryName || "All Assets"}</h1>
              <p className="text-gray-500 mt-1">Manage and track your inventory items</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => toggleModal("add")}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200"
              >
                <FaPlus className="mr-2" />
                Add Asset
              </button>
            </div>
          </div>
        </div>
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <FaFilter className="mr-2" />
                Filter
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <FaDownload className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
        {/* Asset Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { key: "assetId", label: "ID" },
                      { key: null, label: "QR Code" },
                      { key: "assetName", label: "Name" },
                      { key: "issuedTo", label: "Issued To" },
                      { key: "assetCost", label: "Cost" },
                      { key: "assetLocation", label: "Location" },
                      { key: "assetStatus", label: "Status" },
                      { key: "datePurchased", label: "Date Purchased" },
                      { key: null, label: "Actions" },
                    ].map((column) => (
                      <th
                        key={column.label}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex items-center">
                          {column.label}
                          {column.key && (
                            <button onClick={() => requestSort(column.key)} className="ml-1 focus:outline-none">
                              <FaSort className="h-3 w-3 text-gray-400" />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <tr key={item.assetId || item.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.assetId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            {item.AssetQRCodePath ? (
                              <img
                                src={item.AssetQRCodePath || "/placeholder.svg"}
                                alt="QR Code"
                                className="w-10 h-10"
                              />
                            ) : (
                              <QRCodeCanvas
                                value={item.assetCode || "No Code"}
                                size={40}
                                className="border border-gray-200 rounded"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.assetName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.issuedTo || "—"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.assetCost}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.assetLocation || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(item.assetStatus)}`}
                          >
                            {item.assetStatus || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.datePurchased)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewAsset(item)}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item)
                                toggleModal("update")
                              }}
                              className="text-yellow-600 hover:text-yellow-900 transition-colors duration-150"
                              title="Edit Asset"
                            >
                              <FaPen />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item)
                                toggleModal("confirmDelete")
                              }}
                              className="text-red-600 hover:text-red-900 transition-colors duration-150"
                              title="Delete Asset"
                            >
                              <FaTrash />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item)
                                fetchDepreciationSchedule(item.assetId)
                                toggleModal("viewDepreciation")
                              }}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                              title="View Depreciation"
                            >
                              <FaCalendarAlt />
                            </button>
                            <button
                              onClick={() => openDisposeModal(item)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-150"
                              title="Dispose Asset"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-10 text-center text-gray-500">
                        {searchTerm ? "No matching assets found." : "No assets in this category."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Hidden QR Code Reference */}
        <div className="hidden" ref={qrRef}>
          <QRCodeCanvas value={qrData || "placeholder"} />
        </div>
        {/* Add Asset Modal */}
        {modals.add && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-900">Add New Asset</h2>
                <button
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => toggleModal("add")}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <form onSubmit={handleAddAssetItem} className="space-y-6">
                  {/* Form sections */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                        <input
                          type="text"
                          name="AssetName"
                          value={addItem.AssetName}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
                        <input
                          type="number"
                          name="CategoryID"
                          value={categoryId}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100"
                          required
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Dates & Ownership</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Purchased</label>
                        <input
                          type="date"
                          name="DatePurchased"
                          value={addItem.DatePurchased}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Issued</label>
                        <input
                          type="date"
                          name="DateIssued"
                          value={addItem.DateIssued}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issued To</label>
                        <input
                          type="text"
                          name="IssuedTo"
                          value={addItem.IssuedTo}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Checked By</label>
                        <input
                          type="text"
                          name="CheckedBy"
                          value={addItem.CheckedBy}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Financial & Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Cost</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            name="AssetCost"
                            value={addItem.AssetCost}
                            onChange={handleInputChange}
                            className="w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          name="Location"
                          value={addItem.Location}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Status</label>
                        <select
                          name="AssetStatus"
                          value={addItem.AssetStatus}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="">Select Status</option>
                          <option value="Active">Active</option>
                          <option value="In Use">In Use</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Disposed">Disposed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Depreciation Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation Rate (%)</label>
                        <input
                          type="number"
                          name="DepreciationRate"
                          value={addItem.DepreciationRate}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation Period Type</label>
                        <select
                          name="DepreciationPeriodType"
                          value={addItem.DepreciationPeriodType}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="month">Month</option>
                          <option value="year">Year</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Depreciation Period Value
                        </label>
                        <input
                          type="number"
                          name="DepreciationPeriodValue"
                          value={addItem.DepreciationPeriodValue}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Warranty Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Start Date</label>
                        <input
                          type="date"
                          name="WarrantyStartDate"
                          value={addItem.WarrantyStartDate}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiration Date</label>
                        <input
                          type="date"
                          name="WarrantyExpirationDate"
                          value={addItem.WarrantyExpirationDate}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Vendor</label>
                        <input
                          type="text"
                          name="WarrantyVendor"
                          value={addItem.WarrantyVendor}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Contact</label>
                        <input
                          type="text"
                          name="WarrantyContact"
                          value={addItem.WarrantyContact}
                          onChange={handleInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                      <textarea
                        name="Remarks"
                        value={addItem.Remarks}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => toggleModal("add")}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Add Asset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        /* View Asset Modal */
        {modals.view && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-xl font-bold text-white">Asset Details</h2>
                <button
                  onClick={() => toggleModal("view")}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  {/* QR Code */}
                  <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center">
                    <QRCodeCanvas value={selectedItem.assetCode} size={120} />
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedItem.assetName}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Asset ID</p>
                        <p className="font-medium">{selectedItem.assetId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Asset Code</p>
                        <p className="font-medium">{selectedItem.assetCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedItem.assetStatus)}`}
                        >
                          {selectedItem.assetStatus || "Unknown"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{selectedItem.assetLocation || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggle Details Button */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full flex justify-center items-center py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 mb-6"
                >
                  {isExpanded ? "Show Less" : "Show More Details"}
                  <svg
                    className={`ml-2 h-5 w-5 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="space-y-6 mb-6 animate-fadeIn">
                    {/* Financial Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Financial Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Purchase Cost</p>
                          <p className="font-medium">${selectedItem.assetCost}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Current Value</p>
                          <p className="font-medium">
                            $
                            {calculateCurrentValue(
                              selectedItem.assetCost,
                              selectedItem.depreciationRate,
                              selectedItem.datePurchased,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Depreciation Rate</p>
                          <p className="font-medium">
                            {selectedItem.depreciationRate ? `${selectedItem.depreciationRate}%` : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Important Dates</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Date Purchased</p>
                          <p className="font-medium">{formatDate(selectedItem.datePurchased)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date Issued</p>
                          <p className="font-medium">{formatDate(selectedItem.dateIssued)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Warranty Expiration</p>
                          <p className="font-medium">{formatDate(selectedItem.warrantyExpirationDate)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Ownership */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Ownership & Responsibility</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Issued To</p>
                          <p className="font-medium">{selectedItem.issuedTo || "—"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Checked By</p>
                          <p className="font-medium">{selectedItem.checkedBy || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                      <p className="text-sm text-gray-500">Remarks</p>
                      <p className="font-medium">{selectedItem.remarks || "No remarks"}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-between gap-3 pt-4 border-t border-gray-200">
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => {
                        toggleModal("view")
                        setSelectedItem(selectedItem)
                        toggleModal("update")
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FaPen className="mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        toggleModal("view")
                        setSelectedItem(selectedItem)
                        toggleModal("confirmDelete")
                      }}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </button>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => {
                        toggleModal("view")
                        setSelectedItem(selectedItem)
                        fetchDepreciationSchedule(selectedItem.assetId)
                        toggleModal("viewDepreciation")
                      }}
                      className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                    >
                      <FaCalendarAlt className="mr-2" />
                      Depreciation
                    </button>
                    <button
                      onClick={toggleTransferModal}
                      className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50"
                    >
                      <FaExchangeAlt className="mr-2" />
                      Transfer
                    </button>
                    <button
                      onClick={() => {
                        if (selectedItem?.assetId) {
                          openHistoryModal(selectedItem.assetId)
                        }
                      }}
                      className="inline-flex items-center px-3 py-2 border border-purple-300 shadow-sm text-sm leading-4 font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50"
                    >
                      <FaHistory className="mr-2" />
                      History
                    </button>
                    <button
                      onClick={() => {
                        toggleModal("view")
                        openDisposeModal(selectedItem)
                      }}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <FaTrash className="mr-2" />
                      Dispose
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Transfer Modal */}
        {modals.transfer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4 sticky top-0 z-10">
                <h2 className="text-xl font-bold text-white">Transfer Asset</h2>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Asset</p>
                  <p className="font-medium text-gray-900">{selectedItem?.assetName}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Owner</label>
                    <input
                      type="text"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={transferData.newIssuedTo}
                      onChange={(e) =>
                        setTransferData({
                          ...transferData,
                          newIssuedTo: e.target.value,
                        })
                      }
                      placeholder="Enter new owner name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Location</label>
                    <input
                      type="text"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={transferData.newLocation}
                      onChange={(e) =>
                        setTransferData({
                          ...transferData,
                          newLocation: e.target.value,
                        })
                      }
                      placeholder="Enter new location"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={toggleTransferModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransfer}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    Confirm Transfer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* View History Modal */}
        {modals.viewHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-xl font-bold text-white">Asset History</h2>
                <button
                  onClick={() => toggleModal("viewHistory")}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Asset</p>
                  <p className="font-medium text-gray-900">{selectedItem?.assetName}</p>
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <div className="max-h-[50vh] overflow-y-auto">
                    {historyData.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Date
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Action
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Performed By
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Remarks
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {historyData.map((entry) => (
                            <tr key={entry.historyID} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(entry.actionDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {entry.actionType}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {entry.performedBy || "—"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{entry.remarks || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 px-4">
                        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">No history records found for this asset.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => toggleModal("viewHistory")}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        /* View Depreciation Modal */
        {modals.viewDepreciation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-xl font-bold text-white">Depreciation Schedule</h2>
                <button
                  onClick={() => toggleModal("viewDepreciation")}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {loadingDepreciation ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : depreciationData && depreciationData.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <div className="max-h-[50vh] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Date
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Year
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Depreciation Amount
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Remaining Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {depreciationData.map((entry, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(entry.DepreciationDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(entry.DepreciationDate).getFullYear()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${entry.DepreciationValue}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${entry.RemainingValue}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No depreciation schedule available for this asset.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        /* Confirm Delete Modal */
        {modals.confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h2>
                <p className="text-sm text-gray-500">Are you sure you want to delete this asset?</p>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => toggleModal("confirmDelete")}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAsset}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Dispose Asset Modal */}
        {modals.dispose && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                <h2 className="text-lg font-semibold mb-2">Dispose Asset</h2>
                <p className="text-sm">You are about to dispose of this asset. This action cannot be undone.</p>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={disposeData.assetName}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Code</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={disposeData.assetCode}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Category</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={disposeData.assetCategory}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disposal Date</label>
                  <input
                    type="date"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={disposeData.disposalDate}
                    onChange={(e) => setDisposeData({ ...disposeData, disposalDate: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Disposal</label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={disposeData.reason}
                    onChange={(e) => setDisposeData({ ...disposeData, reason: e.target.value })}
                  >
                    <option>Obsolete</option>
                    <option>Damaged</option>
                    <option>Lost</option>
                    <option>Stolen</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Value</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      className="w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={disposeData.originalValue}
                      readOnly
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disposal Value</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      className="w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={disposeData.disposalValue}
                      onChange={(e) => handleDisposalValueChange(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loss Value</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      className="w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={disposeData.lossValue}
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => toggleModal("dispose")}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDispose}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Dispose
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    
        {modals.update && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-900">Update Asset</h2>
                <button
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => toggleModal("update")}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  {/* Form sections */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                        <input
                          type="text"
                          name="AssetName"
                          value={selectedItem.assetName}
                          onChange={(e) => setSelectedItem({ ...selectedItem, assetName: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
                        <input
                          type="number"
                          name="CategoryID"
                          value={categoryId}
                          onChange={(e) => setSelectedItem({ ...selectedItem, categoryID: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100"
                          required
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Dates & Ownership</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Purchased</label>
                        <input
                          type="date"
                          name="DatePurchased"
                          value={selectedItem.datePurchased}
                          onChange={(e) => setSelectedItem({ ...selectedItem, datePurchased: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Issued</label>
                        <input
                          type="date"
                          name="DateIssued"
                          value={selectedItem.dateIssued}
                          onChange={(e) => setSelectedItem({ ...selectedItem, dateIssued: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issued To</label>
                        <input
                          type="text"
                          name="IssuedTo"
                          value={selectedItem.issuedTo}
                          onChange={(e) => setSelectedItem({ ...selectedItem, issuedTo: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Checked By</label>
                        <input
                          type="text"
                          name="CheckedBy"
                          value={selectedItem.checkedBy}
                          onChange={(e) => setSelectedItem({ ...selectedItem, checkedBy: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Financial & Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Cost</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            name="AssetCost"
                            value={selectedItem.assetCost}
                            onChange={(e) => setSelectedItem({ ...selectedItem, assetCost: e.target.value })}
                            className="w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          name="Location"
                          value={selectedItem.assetLocation}
                          onChange={(e) => setSelectedItem({ ...selectedItem, assetLocation: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Status</label>
                        <select
                          name="AssetStatus"
                          value={selectedItem.assetStatus}
                          onChange={(e) => setSelectedItem({ ...selectedItem, assetStatus: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="">Select Status</option>
                          <option value="Active">Active</option>
                          <option value="In Use">In Use</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Disposed">Disposed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Depreciation Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation Rate (%)</label>
                        <input
                          type="number"
                          name="DepreciationRate"
                          value={selectedItem.depreciationRate}
                          onChange={(e) => setSelectedItem({ ...selectedItem, depreciationRate: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation Period Type</label>
                        <select
                          name="DepreciationPeriodType"
                          value={selectedItem.depreciationPeriodType}
                          onChange={(e) => setSelectedItem({ ...selectedItem, depreciationPeriodType: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="month">Month</option>
                          <option value="year">Year</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Depreciation Period Value
                        </label>
                        <input
                          type="number"
                          name="DepreciationPeriodValue"
                          value={selectedItem.depreciationPeriodValue}
                          onChange={(e) =>
                            setSelectedItem({ ...selectedItem, depreciationPeriodValue: e.target.value })
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Warranty Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Start Date</label>
                        <input
                          type="date"
                          name="WarrantyStartDate"
                          value={selectedItem.warrantyStartDate}
                          onChange={(e) => setSelectedItem({ ...selectedItem, warrantyStartDate: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiration Date</label>
                        <input
                          type="date"
                          name="WarrantyExpirationDate"
                          value={selectedItem.warrantyExpirationDate}
                          onChange={(e) => setSelectedItem({ ...selectedItem, warrantyExpirationDate: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Vendor</label>
                        <input
                          type="text"
                          name="WarrantyVendor"
                          value={selectedItem.warrantyVendor}
                          onChange={(e) => setSelectedItem({ ...selectedItem, warrantyVendor: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Contact</label>
                        <input
                          type="text"
                          name="WarrantyContact"
                          value={selectedItem.warrantyContact}
                          onChange={(e) => setSelectedItem({ ...selectedItem, warrantyContact: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                      <textarea
                        name="Remarks"
                        value={selectedItem.remarks}
                        onChange={(e) => setSelectedItem({ ...selectedItem, remarks: e.target.value })}
                        rows={3}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => toggleModal("update")}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Update Asset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
