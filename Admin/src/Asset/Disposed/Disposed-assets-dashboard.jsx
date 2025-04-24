
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Calendar, FileText, Filter, Search, Trash2, RefreshCw, AlertCircle } from "lucide-react"
import DatePicker from "react-date-picker"
import "react-date-picker/dist/DatePicker.css"
import "react-calendar/dist/Calendar.css"

// Custom CSS for DatePicker
import "./date-picker-fix.css"

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
  const [warrantyAssets, setWarrantyAssets] = useState([])
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
    const date = new Date(dateString)
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate days remaining
  const getDaysRemaining = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
        `https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/AssetDisposalApi/GetDisposedAssets?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Disposed assets data:", data)

      // Map the API response to match the component's expected format
      const formattedData = data.map((asset) => ({
        id: asset.AssetID,
        assetName: asset.AssetName,
        assetTag: asset.AssetCode,
        category: categories.find((c) => c.categoryId === asset.CategoryID)?.categoryName || "Unknown",
        disposalDate: asset.DisposalDate,
        disposalReason: asset.DisposalReason,
        originalValue: asset.OriginalValue,
        disposalValue: asset.DisposedValue,
        lossValue: asset.LossValue,
        categoryID: asset.CategoryID,
      }))

      setDisposedAssets(formattedData.length ? formattedData : generateSampleDisposedAssets())
    } catch (error) {
      console.error("Error fetching disposed assets:", error)
      // Fallback to sample data
      setDisposedAssets(generateSampleDisposedAssets())
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch warranty assets
  const fetchWarrantyAssets = async () => {
    setIsLoading(true)
    try {
      // Format dates for API
      const formattedStartDate = startDate.toISOString().split("T")[0]
      const formattedEndDate = endDate.toISOString().split("T")[0]

      // Use the new API endpoint
      const response = await fetch(
        `https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/AssetDisposalApi/GetAssetSummaries?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Warranty assets data:", data)

      // Map the API response to match the component's expected format
      const formattedData = data.map((asset) => ({
        id: asset.AssetId,
        assetName: asset.AssetName,
        assetTag: asset.AssetCode,
        category: asset.AssetCategory,
        categoryId: asset.AssetCategoryId,
        purchaseDate: asset.PurchaseDate,
        warrantyExpiration: asset.WarrantyExpiration,
        vendor: asset.Vendor,
        currentValue: asset.CurrentValue,
      }))

      setWarrantyAssets(formattedData.length ? formattedData : generateSampleWarrantyAssets())
    } catch (error) {
      console.error("Error fetching warranty assets:", error)
      // Fallback to sample data
      setWarrantyAssets(generateSampleWarrantyAssets())
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      // Use the new API endpoint
      const response = await fetch(`https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/AssetNotificationApi/ViewAllNotifications`)

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
      const response = await fetch(`https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/CategoryAssetApi/GetAssetCategory`)

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

  // Filter disposed assets based on search and disposal reason
  const filteredDisposedAssets = disposedAssets.filter((asset) => {
    const matchesSearch =
      asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesReason = disposalReason === "all" || asset.disposalReason === disposalReason

    return matchesSearch && matchesReason
  })

  // Filter warranty assets based on search
  const filteredWarrantyAssets = warrantyAssets.filter((asset) => {
    return (
      asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.vendor.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Handle apply filters
  const handleApplyFilters = () => {
    if (activeTab === "disposed") {
      fetchDisposedAssets()
    } else {
      fetchWarrantyAssets()
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
      } else {
        fetchWarrantyAssets()
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
    fetchDisposedAssets()
    fetchWarrantyAssets()
    fetchNotifications()
    fetchCategories() // Add this line
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
                    notification.Priority.toLowerCase() === "high"
                      ? "border-l-4 border-l-red-500"
                      : notification.Priority.toLowerCase() === "medium"
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
                        <h4 className="font-medium text-gray-900">{notification.AssetName}</h4>
                        <span className="text-xs text-gray-500">{formatDate(notification.Date)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.Message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {notification.AssetCode}
                        </Badge>
                        <Badge
                          variant={
                            notification.Priority.toLowerCase() === "high"
                              ? "destructive"
                              : notification.Priority.toLowerCase() === "medium"
                                ? "warning"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {notification.Priority}
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
        <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
          <TabsTrigger value="disposed" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Disposed Assets
          </TabsTrigger>
          <TabsTrigger value="warranty" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Warranty Tracking
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
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Asset Tag</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Disposal Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Original Value</TableHead>
                        <TableHead className="text-right">Disposal Value</TableHead>
                        <TableHead className="text-right">Loss Value</TableHead>
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
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Asset Tag</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Warranty Expiration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead className="text-right">Current Value</TableHead>
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
      </Tabs>
    </div>
  )
}

export default DisposedAssetsDashboard
