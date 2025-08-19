"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Calendar, FileText, Filter, Search, Trash2, RefreshCw, AlertCircle, TrendingDown } from "lucide-react"
import DatePicker from "react-date-picker"
import "react-date-picker/dist/DatePicker.css"
import "react-calendar/dist/Calendar.css"

// Custom CSS for DatePicker
import "./date-picker-fix.css"

// API base URL constant - easy to change for testing
// const API_BASE_URL = "https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net"
const API_BASE_URL = "http://localhost:5075"
const DisposedAssetsDashboard = () => {
  // Get current date and first day of current month
  const today = new Date()
  const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  // State for filters and data
  const [startDate, setStartDate] = useState(firstDayOfCurrentMonth)
  const [endDate, setEndDate] = useState(today)
  const [searchQuery, setSearchQuery] = useState("")
  const [disposalReason, setDisposalReason] = useState("all")
  const [activeTab, setActiveTab] = useState("disposed")
  const [isLoading, setIsLoading] = useState(true)

  // State for data
  const [disposedAssets, setDisposedAssets] = useState([])
  const [originalDisposedAssets, setOriginalDisposedAssets] = useState([]) // Store original data for filtering
  const [warrantyAssets, setWarrantyAssets] = useState([])
  const [originalWarrantyAssets, setOriginalWarrantyAssets] = useState([]) // Store original data for filtering
  const [notifications, setNotifications] = useState([])

  // Add a new state variable for selected category
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState([])

  // Format currency to Pesos
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  // Calculate days remaining
  const getDaysRemaining = (dateString) => {
    if (!dateString) return 0
    try {
      const date = new Date(dateString)
      const today = new Date()
      const diffTime = date.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch (error) {
      console.error("Error calculating days remaining:", error)
      return 0
    }
  }

  // Get status badge color based on days remaining
  const getStatusBadge = (daysRemaining) => {
    if (daysRemaining < 0) {
      return <Badge variant="destructive">Expired ({Math.abs(daysRemaining)} days ago)</Badge>
    } else if (daysRemaining <= 30) {
      return <Badge variant="destructive">Critical ({daysRemaining} days left)</Badge>
    } else if (daysRemaining <= 90) {
      return <Badge variant="warning">Warning ({daysRemaining} days left)</Badge>
    } else {
      return <Badge variant="outline">Active ({daysRemaining} days left)</Badge>
    }
  }

  // Fetch disposed assets
  const fetchDisposedAssets = async () => {
    setIsLoading(true)
    try {
      // Format dates for API
      const formattedStartDate = startDate.toISOString().split("T")[0]
      const formattedEndDate = endDate.toISOString().split("T")[0]

      // Use the new API endpoint
      const response = await fetch(
        `${API_BASE_URL}/api/AssetDisposalApi/GetDisposedAssets?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Disposed assets data:", data)

      // Map the API response to match the component's expected format
      const formattedData = data.map((asset) => ({
        id: asset.AssetID,
        assetName: asset.AssetName || "Unknown",
        assetTag: asset.AssetCode || "Unknown",
        category: categories.find((c) => c.categoryId === asset.CategoryID)?.categoryName || "Unknown",
        disposalDate: asset.DisposalDate,
        disposalReason: asset.DisposalReason || "Unknown",
        originalValue: asset.OriginalValue || 0,
        disposalValue: asset.DisposedValue || 0,
        lossValue: asset.LossValue || 0,
        categoryID: asset.CategoryID,
      }))

      const finalData = formattedData.length ? formattedData : generateSampleDisposedAssets()
      setDisposedAssets(finalData)
      setOriginalDisposedAssets(finalData) // Store original data for filtering
    } catch (error) {
      console.error("Error fetching disposed assets:", error)
      // Fallback to sample data
      const sampleData = generateSampleDisposedAssets()
      setDisposedAssets(sampleData)
      setOriginalDisposedAssets(sampleData) // Store original data for filtering
    } finally {
      setIsLoading(false)
    }
  }

  // Modify the fetchWarrantyAssets function to properly handle API response data
  const fetchWarrantyAssets = async () => {
    setIsLoading(true)
    try {
      // Format dates for API
      const formattedStartDate = startDate.toISOString().split("T")[0]
      const formattedEndDate = endDate.toISOString().split("T")[0]

      // Use the new API endpoint
      const response = await fetch(
        `${API_BASE_URL}/api/AssetDisposalApi/GetAssetSummaries?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Warranty assets data:", data)

      // Map the API response to match the component's expected format
      const formattedData = data.map((asset) => ({
        id: asset.AssetId || asset.assetId || 0,
        assetName: asset.AssetName || asset.assetName || "Unknown",
        assetTag: asset.AssetCode || asset.assetCode || "Unknown",
        category: asset.AssetCategory || asset.categoryName || "Unknown",
        categoryId: asset.AssetCategoryId || asset.categoryId,
        purchaseDate: asset.PurchaseDate || asset.datePurchased,
        warrantyExpiration: asset.WarrantyExpiration || asset.warrantyExpiration,
        vendor: asset.Vendor || asset.vendor || "Unknown",
        currentValue: asset.CurrentValue || asset.currentValue || 0,
        initialCost: asset.AssetCost || asset.initialCost || asset.CurrentValue || 0,
        depreciationRate: asset.DepreciationRate || asset.depreciationRate || 0.2,
        usefulLifeYears: asset.UsefulLifeYears || asset.usefulLifeYears || 5,
      }))

      const finalData = formattedData.length ? formattedData : generateSampleWarrantyAssets()
      setWarrantyAssets(finalData)
      setOriginalWarrantyAssets(finalData) // Store original data for filtering
    } catch (error) {
      console.error("Error fetching warranty assets:", error)
      // Fallback to sample data
      const sampleData = generateSampleWarrantyAssets()
      setWarrantyAssets(sampleData)
      setOriginalWarrantyAssets(sampleData) // Store original data for filtering
    } finally {
      setIsLoading(false)
    }
  }

  // Modify the fetchDepreciationData function to properly handle API response data
  const fetchDepreciationData = async () => {
    setIsLoading(true)
    try {
      // Format dates for API
      const formattedStartDate = startDate.toISOString().split("T")[0]
      const formattedEndDate = endDate.toISOString().split("T")[0]

      // Use the depreciation API endpoint
      const response = await fetch(`${API_BASE_URL}/api/AssetDisposalApi/GetAssetsWithDepreciation`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Depreciation data:", data)

      // Map the API response to match the component's expected format
      const formattedData = data.map((asset) => ({
        id: asset.assetId || 0,
        assetName: asset.assetName || "Unknown",
        assetTag: asset.assetCode || "Unknown",
        category: asset.categoryName || "Unknown",
        categoryId: asset.categoryId,
        purchaseDate: asset.datePurchased,
        warrantyExpiration: asset.warrantyExpiration || null,
        vendor: asset.vendor || "Unknown",
        currentValue: asset.currentValue || 0,
        initialCost: asset.initialCost || 0,
        depreciationRate: asset.depreciationRate || 0.2,
        usefulLifeYears: asset.usefulLifeYears || 5,
        depreciationPercentage: asset.depreciationPercentage || 0,
        depreciationStatus: asset.depreciationStatus || "Unknown",
      }))

      const finalData = formattedData.length ? formattedData : generateSampleWarrantyAssets()
      setWarrantyAssets(finalData)
      setOriginalWarrantyAssets(finalData) // Store original data for filtering
    } catch (error) {
      console.error("Error fetching depreciation data:", error)
      // Fallback to sample data
      const sampleData = generateSampleWarrantyAssets()
      setWarrantyAssets(sampleData)
      setOriginalWarrantyAssets(sampleData) // Store original data for filtering
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      // Use the new API endpoint
      const response = await fetch(`${API_BASE_URL}/api/AssetNotificationApi/ViewAllNotifications`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Notifications data:", data)

      // Update notifications state with the API response
      setNotifications(data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      // Fallback to sample data if API fails
      setNotifications(generateSampleNotifications())
    }
  }

  // Add a function to fetch categories
  const fetchCategories = async () => {
    try {
      // Use the correct API endpoint
      const response = await fetch(`${API_BASE_URL}/api/CategoryAssetApi/GetAssetCategory`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Categories data:", data)
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      // Fallback to sample categories with matching property names
      setCategories([
        { categoryId: 1, categoryName: "Electronics" },
        { categoryId: 2, categoryName: "Furniture" },
        { categoryId: 3, categoryName: "Vehicles" },
        { categoryId: 4, categoryName: "Office Equipment" },
        { categoryId: 5, categoryName: "IT Hardware" },
        { categoryId: 6, categoryName: "Software" },
        { categoryId: 7, categoryName: "Networking" },
      ])
    }
  }

  // Generate sample disposed assets for demo
  const generateSampleDisposedAssets = () => {
    return [
      {
        id: 1,
        assetName: "Dell Latitude E7450",
        assetTag: "LT-2019-001",
        category: "Laptops",
        disposalDate: "2023-11-15",
        disposalReason: "Obsolete",
        originalValue: 45000,
        disposalValue: 5000,
        lossValue: 40000,
      },
      {
        id: 2,
        assetName: "HP LaserJet Pro M402n",
        assetTag: "PR-2018-003",
        category: "Printers",
        disposalDate: "2023-12-10",
        disposalReason: "Damaged",
        originalValue: 15000,
        disposalValue: 0,
        lossValue: 15000,
      },
      {
        id: 3,
        assetName: "Lenovo ThinkCentre M720",
        assetTag: "PC-2020-015",
        category: "Desktops",
        disposalDate: "2024-01-05",
        disposalReason: "Obsolete",
        originalValue: 35000,
        disposalValue: 8000,
        lossValue: 27000,
      },
      {
        id: 4,
        assetName: "Cisco IP Phone 8841",
        assetTag: "PH-2019-022",
        category: "Phones",
        disposalDate: "2024-02-20",
        disposalReason: "Damaged",
        originalValue: 12000,
        disposalValue: 0,
        lossValue: 12000,
      },
      {
        id: 5,
        assetName: 'Samsung 27" Monitor',
        assetTag: "MN-2021-007",
        category: "Monitors",
        disposalDate: "2024-03-01",
        disposalReason: "Sold",
        originalValue: 18000,
        disposalValue: 5000,
        lossValue: 13000,
      },
    ]
  }

  // Generate sample warranty assets for demo
  const generateSampleWarrantyAssets = () => {
    const today = new Date()

    // Create dates relative to today
    const createRelativeDate = (dayOffset) => {
      const date = new Date(today)
      date.setDate(date.getDate() + dayOffset)
      return date.toISOString().split("T")[0]
    }

    return [
      {
        id: 1,
        assetName: "Dell PowerEdge R740 Server",
        assetTag: "SV-2022-001",
        category: "Servers",
        purchaseDate: "2022-04-15",
        warrantyExpiration: createRelativeDate(15),
        vendor: "Dell Technologies",
        supportContact: "support@dell.com",
        currentValue: 350000,
      },
      {
        id: 2,
        assetName: "HP Color LaserJet Pro MFP",
        assetTag: "PR-2023-002",
        category: "Printers",
        purchaseDate: "2023-01-10",
        warrantyExpiration: createRelativeDate(120),
        vendor: "HP Inc.",
        supportContact: "support@hp.com",
        currentValue: 45000,
      },
      {
        id: 3,
        assetName: "Lenovo ThinkPad X1 Carbon",
        assetTag: "LT-2023-005",
        category: "Laptops",
        purchaseDate: "2023-03-22",
        warrantyExpiration: createRelativeDate(-10),
        vendor: "Lenovo",
        supportContact: "support@lenovo.com",
        currentValue: 85000,
      },
      {
        id: 4,
        assetName: "Cisco Catalyst 9300 Switch",
        assetTag: "NW-2022-003",
        category: "Networking",
        purchaseDate: "2022-11-05",
        warrantyExpiration: createRelativeDate(25),
        vendor: "Cisco Systems",
        supportContact: "tac@cisco.com",
        currentValue: 120000,
      },
      {
        id: 5,
        assetName: 'Apple MacBook Pro 16"',
        assetTag: "LT-2023-010",
        category: "Laptops",
        purchaseDate: "2023-06-15",
        warrantyExpiration: createRelativeDate(200),
        vendor: "Apple Inc.",
        supportContact: "support@apple.com",
        currentValue: 150000,
      },
    ]
  }

  // Generate sample notifications for demo
  const generateSampleNotifications = () => {
    return [
      {
        Id: 1,
        AssetName: "Dell Laptop",
        AssetCode: "LT-123",
        Date: new Date().toISOString(),
        Message: "Warranty expiring soon",
        Priority: "High",
        Type: "Warranty",
        Read: false,
        CategoryId: 5,
      },
      {
        Id: 2,
        AssetName: "HP Printer",
        AssetCode: "PR-456",
        Date: new Date().toISOString(),
        Message: "Asset transferred to new department",
        Priority: "Medium",
        Type: "Transfer",
        Read: true,
        CategoryId: 4,
      },
      {
        Id: 3,
        AssetName: "Cisco Router",
        AssetCode: "RT-789",
        Date: new Date().toISOString(),
        Message: "Depreciation threshold reached",
        Priority: "Low",
        Type: "Depreciation",
        Read: false,
        CategoryId: 7,
      },
    ]
  }

  // Add this function to get the appropriate icon based on notification type
  const getNotificationTypeIcon = (type) => {
    if (!type) return <AlertCircle className="h-5 w-5" />

    switch (type.toLowerCase()) {
      case "warranty":
        return <Calendar className="h-5 w-5" />
      case "transfer":
        return <RefreshCw className="h-5 w-5" />
      case "depreciation":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  // Add this function to get the appropriate color based on notification type
  const getNotificationTypeColor = (type) => {
    if (!type) return "text-gray-500"

    switch (type.toLowerCase()) {
      case "warranty":
        return "text-amber-500"
      case "transfer":
        return "text-green-500"
      case "depreciation":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  // Safe string comparison function
  const safeStringIncludes = (str, searchStr) => {
    if (typeof str !== "string" || !str) return false
    if (typeof searchStr !== "string" || !searchStr) return true // Empty search matches everything
    return str.toLowerCase().includes(searchStr.toLowerCase())
  }

  // Filter disposed assets based on search and disposal reason
  const filteredDisposedAssets = originalDisposedAssets.filter((asset) => {
    // Safe search matching
    const matchesSearch =
      searchQuery === "" ||
      safeStringIncludes(asset.assetName, searchQuery) ||
      safeStringIncludes(asset.assetTag, searchQuery) ||
      safeStringIncludes(asset.category, searchQuery)

    // Safe reason matching
    const matchesReason = disposalReason === "all" || (asset.disposalReason && asset.disposalReason === disposalReason)

    return matchesSearch && matchesReason
  })

  // Filter warranty assets based on search
  const filteredWarrantyAssets = originalWarrantyAssets.filter((asset) => {
    if (searchQuery === "") return true

    return (
      safeStringIncludes(asset.assetName, searchQuery) ||
      safeStringIncludes(asset.assetTag, searchQuery) ||
      safeStringIncludes(asset.category, searchQuery) ||
      safeStringIncludes(asset.vendor, searchQuery)
    )
  })

  // Handle date changes
  const handleStartDateChange = (date) => {
    if (date && !isNaN(date.getTime())) {
      setStartDate(date)
    }
  }

  const handleEndDateChange = (date) => {
    if (date && !isNaN(date.getTime())) {
      setEndDate(date)
    }
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // Handle apply filters
  const handleApplyFilters = () => {
    if (activeTab === "disposed") {
      fetchDisposedAssets()
    } else if (activeTab === "warranty") {
      fetchWarrantyAssets()
    } else if (activeTab === "depreciation") {
      fetchDepreciationData()
    }
  }

  // Handle reset filters
  const handleResetFilters = () => {
    setStartDate(firstDayOfCurrentMonth)
    setEndDate(today)
    setSearchQuery("")
    setDisposalReason("all")

    // Fetch data after a short delay to ensure state is updated
    setTimeout(() => {
      if (activeTab === "disposed") {
        fetchDisposedAssets()
      } else if (activeTab === "warranty") {
        fetchWarrantyAssets()
      } else if (activeTab === "depreciation") {
        fetchDepreciationData()
      }
    }, 100)
  }

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value)
    if (value === "disposed") {
      fetchDisposedAssets()
    } else if (value === "warranty") {
      fetchWarrantyAssets()
    } else if (value === "depreciation") {
      fetchDepreciationData()
    }
  }

  // Navigate to all notifications
  const handleViewAllNotifications = () => {
    // You can implement navigation to a dedicated notifications page
    console.log("Navigate to all notifications")
    // Example: navigate("/notifications")
  }

  // Modify the useEffect to fetch categories
  useEffect(() => {
    fetchCategories() // Fetch categories first
      .then(() => {
        // After categories are loaded, fetch other data
        fetchDisposedAssets()
        fetchWarrantyAssets()
        fetchNotifications()
      })
  }, [])

  // Add a function to filter notifications by category
  const filteredNotifications = notifications.filter((notification) => {
    return (
      selectedCategory === "all" || (notification.CategoryId && notification.CategoryId.toString() === selectedCategory)
    )
  })

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Asset Lifecycle Management</h1>
          <p className="text-gray-500 mt-1">Track disposed assets and warranty expirations</p>
        </div>
      </div>

      {/* Notifications Component */}
      <Card className="shadow-md bg-white">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Notifications</CardTitle>
            <Badge variant="outline" className="mt-1">
              {notifications.filter((n) => !n.Read).length} New
            </Badge>
          </div>
          <div className="w-full sm:w-64">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No notifications available for this category</p>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.Id}
                  className={`p-3 rounded-lg border ${
                    notification.Read ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                  } ${
                    notification.Priority?.toLowerCase() === "high"
                      ? "border-l-4 border-l-red-500"
                      : notification.Priority?.toLowerCase() === "medium"
                        ? "border-l-4 border-l-amber-500"
                        : "border-l-4 border-l-green-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${getNotificationTypeColor(notification.Type)}`}>
                      {getNotificationTypeIcon(notification.Type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-900">{notification.AssetName || "Unknown Asset"}</h4>
                        <span className="text-xs text-gray-500">{formatDate(notification.Date)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.Message || "No message"}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {notification.AssetCode || "No Code"}
                        </Badge>
                        <Badge
                          variant={
                            notification.Priority?.toLowerCase() === "high"
                              ? "destructive"
                              : notification.Priority?.toLowerCase() === "medium"
                                ? "warning"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {notification.Priority || "Low"}
                        </Badge>
                        {notification.CategoryId &&
                          categories.find((c) => c.categoryId?.toString() === notification.CategoryId?.toString()) && (
                            <Badge variant="secondary" className="text-xs">
                              {categories.find((c) => c.categoryId?.toString() === notification.CategoryId?.toString())
                                ?.categoryName || "Unknown"}
                            </Badge>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="link" className="w-full justify-start mt-4">
            View All Notifications
          </Button>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="disposed" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[500px]">
          <TabsTrigger value="disposed" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Disposed Assets
          </TabsTrigger>
          <TabsTrigger value="warranty" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Warranty Tracking
          </TabsTrigger>
          <TabsTrigger value="depreciation" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Depreciation
          </TabsTrigger>
        </TabsList>

        {/* Filters Card */}
        <Card className="shadow-md bg-white my-6">
          <CardHeader>
            <CardTitle className="text-xl">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Start Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 h-4 w-4 text-gray-500 z-10" />
                  <DatePicker
                    onChange={handleStartDateChange}
                    value={startDate}
                    format="y-MM-dd"
                    clearIcon={null}
                    calendarIcon={null}
                    className="pl-10 border border-gray-300 rounded-md py-2 w-full bg-white"
                  />
                </div>
              </div>

              {/* End Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 h-4 w-4 text-gray-500 z-10" />
                  <DatePicker
                    onChange={handleEndDateChange}
                    value={endDate}
                    format="y-MM-dd"
                    clearIcon={null}
                    calendarIcon={null}
                    className="pl-10 border border-gray-300 rounded-md py-2 w-full bg-white"
                    minDate={startDate}
                  />
                </div>
              </div>

              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Disposal Reason (only for disposed assets tab) */}
              {activeTab === "disposed" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Disposal Reason</label>
                  <Select value={disposalReason} onValueChange={setDisposalReason}>
                    <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reasons</SelectItem>
                      <SelectItem value="Obsolete">Obsolete</SelectItem>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                      <SelectItem value="Donated">Donated</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Filter Action Buttons */}
            <div className="flex justify-end mt-6 gap-3">
              <Button variant="outline" onClick={handleResetFilters} disabled={isLoading}>
                Reset Filters
              </Button>
              <Button onClick={handleApplyFilters} disabled={isLoading} className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disposed Assets Tab Content */}
        <TabsContent value="disposed" className="mt-0">
          <Card className="shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-xl">Disposed Assets</CardTitle>
              <CardDescription>
                Assets that have been removed from inventory through disposal, sale, or loss
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 w-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : filteredDisposedAssets.length === 0 ? (
                <div className="text-center py-10">
                  <Trash2 className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No disposed assets found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your filters or search criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white bg-gray-800">Asset Name</TableHead>
                        <TableHead className="text-white bg-gray-800">Asset Tag</TableHead>
                        <TableHead className="text-white bg-gray-800">Category</TableHead>
                        <TableHead className="text-white bg-gray-800">Disposal Date</TableHead>
                        <TableHead className="text-white bg-gray-800">Reason</TableHead>
                        <TableHead className="text-right text-white bg-gray-800">Original Value</TableHead>
                        <TableHead className="text-right text-white bg-gray-800">Disposal Value</TableHead>
                        <TableHead className="text-right text-white bg-gray-800">Loss Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDisposedAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.assetName}</TableCell>
                          <TableCell>{asset.assetTag}</TableCell>
                          <TableCell>{asset.category}</TableCell>
                          <TableCell>{formatDate(asset.disposalDate)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                asset.disposalReason === "Damaged" || asset.disposalReason === "Lost"
                                  ? "destructive"
                                  : asset.disposalReason === "Obsolete"
                                    ? "warning"
                                    : "outline"
                              }
                            >
                              {asset.disposalReason}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(asset.originalValue)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(asset.disposalValue)}</TableCell>
                          <TableCell className="text-right font-medium text-destructive">
                            {formatCurrency(asset.lossValue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warranty Tracking Tab Content */}
        <TabsContent value="warranty" className="mt-0">
          <Card className="shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-xl">Warranty Tracking</CardTitle>
              <CardDescription>Monitor warranty status and upcoming expirations for your assets</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 w-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : filteredWarrantyAssets.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No warranty data found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your filters or search criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white bg-gray-800">Asset Name</TableHead>
                        <TableHead className="text-white bg-gray-800">Asset Tag</TableHead>
                        <TableHead className="text-white bg-gray-800">Category</TableHead>
                        <TableHead className="text-white bg-gray-800">Purchase Date</TableHead>
                        <TableHead className="text-white bg-gray-800">Warranty Expiration</TableHead>
                        <TableHead className="text-white bg-gray-800">Status</TableHead>
                        <TableHead className="text-white bg-gray-800">Vendor</TableHead>
                        <TableHead className="text-right text-white bg-gray-800">Current Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWarrantyAssets.map((asset) => {
                        const daysRemaining = getDaysRemaining(asset.warrantyExpiration)
                        return (
                          <TableRow key={asset.id}>
                            <TableCell className="font-medium">{asset.assetName}</TableCell>
                            <TableCell>{asset.assetTag}</TableCell>
                            <TableCell>{asset.category}</TableCell>
                            <TableCell>{formatDate(asset.purchaseDate)}</TableCell>
                            <TableCell>{formatDate(asset.warrantyExpiration)}</TableCell>
                            <TableCell>{getStatusBadge(daysRemaining)}</TableCell>
                            <TableCell>{asset.vendor}</TableCell>
                            <TableCell className="text-right">{formatCurrency(asset.currentValue)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Depreciation Tracking Tab Content */}
        <TabsContent value="depreciation" className="mt-0">
          <Card className="shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-xl">Asset Depreciation</CardTitle>
              <CardDescription>Track asset value and depreciation status over time</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 w-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white bg-gray-800">Asset Name</TableHead>
                        <TableHead className="text-white bg-gray-800">Asset Tag</TableHead>
                        <TableHead className="text-white bg-gray-800">Category</TableHead>
                        <TableHead className="text-white bg-gray-800">Purchase Date</TableHead>
                        <TableHead className="text-right text-white bg-gray-800">Initial Cost</TableHead>
                        <TableHead className="text-right text-white bg-gray-800">Current Value</TableHead>
                        <TableHead className="text-center text-white bg-gray-800">Remaining Value %</TableHead>
                        <TableHead className="text-white bg-gray-800">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWarrantyAssets.map((asset) => {
                        // Calculate depreciation (simplified example)
                        const purchaseDate = new Date(asset.purchaseDate || new Date())
                        const today = new Date()
                        const yearsSincePurchase = (today - purchaseDate) / (1000 * 60 * 60 * 24 * 365.25)

                        // Assume 20% depreciation per year (straight-line method)
                        const depreciationRate = asset.depreciationRate || 0.2
                        const usefulLifeYears = asset.usefulLifeYears || 5

                        // Calculate current value
                        const initialCost = asset.initialCost || asset.currentValue || 0
                        const currentValue =
                          asset.currentValue ||
                          Math.max(
                            0,
                            initialCost -
                              initialCost * depreciationRate * Math.min(yearsSincePurchase, usefulLifeYears),
                          )

                        // Calculate percentage of original value remaining
                        const percentRemaining = initialCost > 0 ? Math.round((currentValue / initialCost) * 100) : 0

                        // Determine status based on percentage
                        let statusBadge
                        if (percentRemaining >= 90) {
                          statusBadge = (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Excellent (90-100%)
                            </Badge>
                          )
                        } else if (percentRemaining >= 70) {
                          statusBadge = (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Good (70-89%)
                            </Badge>
                          )
                        } else if (percentRemaining >= 50) {
                          statusBadge = (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Fair (50-69%)
                            </Badge>
                          )
                        } else if (percentRemaining >= 30) {
                          statusBadge = (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              Poor (30-49%)
                            </Badge>
                          )
                        } else if (percentRemaining >= 10) {
                          statusBadge = (
                            <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                              Critical (10-29%)
                            </Badge>
                          )
                        } else {
                          statusBadge = <Badge variant="destructive">End of Life (&lt;10%)</Badge>
                        }

                        return (
                          <TableRow key={asset.id}>
                            <TableCell className="font-medium">{asset.assetName}</TableCell>
                            <TableCell>{asset.assetTag}</TableCell>
                            <TableCell>{asset.category}</TableCell>
                            <TableCell>{formatDate(asset.purchaseDate)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(initialCost)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(currentValue)}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">{percentRemaining}%</span>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                  <div
                                    className={`h-2.5 rounded-full ${
                                      percentRemaining >= 70
                                        ? "bg-green-500"
                                        : percentRemaining >= 50
                                          ? "bg-blue-500"
                                          : percentRemaining >= 30
                                            ? "bg-amber-500"
                                            : percentRemaining >= 10
                                              ? "bg-orange-500"
                                              : "bg-red-500"
                                    }`}
                                    style={{ width: `${percentRemaining}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{statusBadge}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DisposedAssetsDashboard
