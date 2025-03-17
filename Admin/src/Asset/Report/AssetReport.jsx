"use client"

import { useState, useEffect } from "react"
import DatePicker from "react-date-picker"
import "react-date-picker/dist/DatePicker.css"
import "react-calendar/dist/Calendar.css"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../Components/ui/select"
import { Button } from "../../Components/ui/button"
import { CalendarIcon, BarChart3, PieChartIcon, LineChartIcon, RefreshCw } from "lucide-react"

const ReportDashboard = () => {
  const [reportType, setReportType] = useState("depreciation")
  const [startDate, setStartDate] = useState(new Date("2024-01-01"))
  const [endDate, setEndDate] = useState(new Date("2030-01-01"))
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [assetCategories, setAssetCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartType, setChartType] = useState("pie")
  const [activeTab, setActiveTab] = useState("count")
  const [summaryData, setSummaryData] = useState({
    totalValue: 0,
    categoriesCount: 0,
    currentDate: new Date().toLocaleDateString(),
  })

  const [totalasset, setTotalAsset] = useState([])
  const [isFiltered, setIsFiltered] = useState(false)

  // Color palette for charts
  const COLORS = [
    "#4f46e5", // Indigo
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Violet
    "#06b6d4", // Cyan
    "#ec4899", // Pink
    "#84cc16", // Lime
  ]

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format date for API
  const formatDateForApi = (date) => {
    return date.toISOString().split("T")[0]
  }

  // Fetch data from API with optional date filters
  const fetchData = async (withFilters = false) => {
    setIsLoading(true)
    setIsFiltered(withFilters)

    try {
      let url = "http://localhost:5075/api/AssetItemApi/asset-category-summary"

      // Add date filters if requested
      if (withFilters && startDate && endDate) {
        url = `${url}?startDate=${formatDateForApi(startDate)}&endDate=${formatDateForApi(endDate)}`
      }

      console.log("Fetching data from:", url)
      const response = await fetch(url)
      const data = await response.json()
      console.log("Raw API response:", data)
      setTotalAsset(data)
      if (!Array.isArray(data)) {
        console.error("API did not return an array:", data)
        setAssetCategories([])
        setIsLoading(false)
        return
      }

      // Process data for charts - ensure proper case mapping
      const processedData = data.map((item, index) => {
        // Debug each item
        console.log("Processing item:", item)

        return {
          ...item,
          fill: COLORS[index % COLORS.length],
          Count: item.assetCount || 0,
          Value: item.currentTotalValue || 0,
          CategoryName: item.categoryName || `Category ${index + 1}`,
        }
      })

      console.log("Processed data for charts:", processedData)
      setAssetCategories(processedData)

      // Calculate summary data
      
      const totalValue = processedData.reduce((sum, item) => sum + (item.currentTotalValue || 0), 0)

      setSummaryData({
        totalValue,
        categoriesCount: processedData.length,
        currentDate: new Date().toLocaleDateString(),
      })

      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching asset categories:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData(true) // Initial load with default filters

    console.log(totalasset)
  }, [])

  // Handle refresh button click
  const handleRefresh = () => {
    fetchData(isFiltered)
  }

  // Handle apply filters button click
  const handleApplyFilters = () => {
    fetchData(true)
  }

  // Handle reset filters button click
  const handleResetFilters = () => {
    setStartDate(new Date("2024-01-01"))
    setEndDate(new Date("2030-01-01"))
    fetchData(false)
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-semibold text-gray-800">{payload[0].payload.CategoryName}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Count:</span> {payload[0].payload.assetCount || payload[0].payload.Count}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Value:</span>{" "}
            {formatCurrency(payload[0].payload.currentTotalValue || payload[0].payload.Value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Asset Reports</h1>
          <p className="text-gray-500 mt-1">Analyze and track your asset inventory</p>
        </div>

        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      {/* Current Total Value Card */}
      <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardDescription className="text-sm font-medium text-blue-500">
              {isFiltered
                ? `Total Asset Value (${formatDateForApi(startDate)} to ${formatDateForApi(endDate)})`
                : "Current Total Asset Value"}
            </CardDescription>
            <CardTitle className="text-4xl font-bold">{formatCurrency(summaryData.totalValue)}</CardTitle>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">As of {summaryData.currentDate}</p>
            <p className="text-xs text-gray-400 mt-1">Based on latest depreciation data</p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {isFiltered
              ? "Filtered value based on selected date range"
              : "Current total value of all assets after applying depreciation calculations"}
          </p>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription className="text-sm font-medium text-indigo-500">Total Assets</CardDescription>
            <CardTitle className="text-3xl font-bold">{summaryData.totalAssets}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">Assets across all categories</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription className="text-sm font-medium text-emerald-500">Average Value</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {summaryData.totalAssets > 0
                ? formatCurrency(summaryData.totalValue / summaryData.totalAssets)
                : formatCurrency(0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">Average value per asset</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription className="text-sm font-medium text-amber-500">Categories</CardDescription>
            <CardTitle className="text-3xl font-bold">{summaryData.categoriesCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">Different asset categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-md bg-white mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Report Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warranty">Asset Warranty</SelectItem>
                  <SelectItem value="maintenance">Asset Maintenance</SelectItem>
                  <SelectItem value="depreciation">Asset Depreciation</SelectItem>
                  <SelectItem value="transfer">Asset Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <div className="relative flex items-center">
                <CalendarIcon className="absolute left-3 h-4 w-4 text-gray-500" />
                <DatePicker
                  onChange={setStartDate}
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
                <CalendarIcon className="absolute left-3 h-4 w-4 text-gray-500" />
                <DatePicker
                  onChange={setEndDate}
                  value={endDate}
                  format="y-MM-dd"
                  clearIcon={null}
                  calendarIcon={null}
                  className="pl-10 border border-gray-300 rounded-md py-2 w-full bg-white"
                  minDate={startDate}
                />
              </div>
            </div>

            {/* Chart Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Chart Type</label>
              <div className="flex space-x-2">
                <Button
                  variant={chartType === "pie" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("pie")}
                  className="flex-1"
                >
                  <PieChartIcon className="h-4 w-4 mr-1" />
                  Pie
                </Button>
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                  className="flex-1"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Bar
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("line")}
                  className="flex-1"
                >
                  <LineChartIcon className="h-4 w-4 mr-1" />
                  Line
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Action Buttons */}
          <div className="flex justify-end mt-6 gap-3">
            <Button variant="outline" onClick={handleResetFilters} disabled={isLoading}>
              Reset Filters
            </Button>
            <Button onClick={handleApplyFilters} disabled={isLoading}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart Display */}
      <Card className="shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-xl">
            {isFiltered
              ? `Asset Value Report (${formatDateForApi(startDate)} to ${formatDateForApi(endDate)})`
              : "Current Asset Value Report"}
          </CardTitle>
          <CardDescription>
            {reportType === "depreciation" && "Asset depreciation and current values by category"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : assetCategories.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-gray-500">No data available</p>
              </div>
            ) : (
              <div className="w-full">
                {/* Custom Tabs Implementation */}
                <div className="flex justify-start items-center mb-4 border-b border-gray-200">
                  <button
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === "count"
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("count")}
                  >
                    Asset Count
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === "value"
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("value")}
                  >
                    Asset Value
                  </button>
                </div>

                <div className="h-[350px]">
                  {activeTab === "count" && (
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "pie" && (
                        <PieChart>
                          <Pie
                            data={assetCategories}
                            dataKey="assetCount"
                            nameKey="categoryName"
                            cx="50%"
                            cy="50%"
                            outerRadius={130}
                            innerRadius={70}
                            paddingAngle={2}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {assetCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                      )}

                      {chartType === "bar" && (
                        <BarChart data={assetCategories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="categoryName" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="assetCount" name="Asset Count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}

                      {chartType === "line" && (
                        <AreaChart data={assetCategories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="categoryName" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="assetCount"
                            name="Asset Count"
                            stroke="#4f46e5"
                            fill="#4f46e5"
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  )}

                  {activeTab === "value" && (
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "pie" && (
                        <PieChart>
                          <Pie
                            data={assetCategories}
                            dataKey="currentTotalValue"
                            nameKey="categoryName"
                            cx="50%"
                            cy="50%"
                            outerRadius={130}
                            innerRadius={70}
                            paddingAngle={2}
                            label={({ name, value }) => `${name} (${formatCurrency(value)})`}
                          >
                            {assetCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                      )}

                      {chartType === "bar" && (
                        <BarChart data={assetCategories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="categoryName" />
                          <YAxis tickFormatter={(value) => formatCurrency(value)} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="currentTotalValue" name="Asset Value" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}

                      {chartType === "line" && (
                        <AreaChart data={assetCategories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="categoryName" />
                          <YAxis tickFormatter={(value) => formatCurrency(value)} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="currentTotalValue"
                            name="Asset Value"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReportDashboard

