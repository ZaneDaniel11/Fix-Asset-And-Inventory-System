"use client"

import { useState, useEffect, useRef } from "react"
import DatePicker from "react-date-picker"
import "react-date-picker/dist/DatePicker.css"
import "react-calendar/dist/Calendar.css"

// Custom styles to fix DatePicker issues
import "./date-picker-fix.css"

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
  // Debug ref to track date changes
  const debugRef = useRef({
    lastStartDate: null,
    lastEndDate: null,
  })

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
    totalAssets: 0,
    totalValue: 0,
    averageValue: 0,
    categoriesCount: 0,
    currentDate: new Date().toLocaleDateString(),
  })
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

  // Custom date change handlers with validation and debugging
  const handleStartDateChange = (date) => {
    console.log("Start date changed to:", date)

    // Validate date
    if (!date) {
      console.warn("Invalid start date, using default")
      date = new Date("2024-01-01")
    }

    // Update debug ref
    debugRef.current.lastStartDate = date

    // Update state
    setStartDate(date)

    // If end date is before start date, update end date
    if (endDate < date) {
      const newEndDate = new Date(date)
      newEndDate.setMonth(date.getMonth() + 1)
      setEndDate(newEndDate)
      debugRef.current.lastEndDate = newEndDate
      console.log("Automatically adjusted end date to:", newEndDate)
    }
  }

  const handleEndDateChange = (date) => {
    console.log("End date changed to:", date)

    // Validate date
    if (!date) {
      console.warn("Invalid end date, using default")
      date = new Date("2030-01-01")
    }

    // Update debug ref
    debugRef.current.lastEndDate = date

    // Update state
    setEndDate(date)
  }

  // Fetch data from API with optional date filters
  const fetchData = async (withFilters = false) => {
    setIsLoading(true)
    setIsFiltered(withFilters)

    try {
      let url = "http://localhost:5075/api/AssetItemApi/asset-category-summary"

      // Add date filters if requested
      if (withFilters && startDate && endDate) {
        const formattedStartDate = formatDateForApi(startDate)
        const formattedEndDate = formatDateForApi(endDate)
        url = `${url}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
        console.log(`Applying date filters: ${formattedStartDate} to ${formattedEndDate}`)
        console.log("Current date objects:", { startDate, endDate })
      }

      console.log("Fetching data from:", url)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log("Raw API response:", data)

      if (!Array.isArray(data)) {
        console.error("API did not return an array:", data)
        setAssetCategories([])
        setIsLoading(false)
        return
      }

      // Process data for charts - ensure proper case mapping
      const processedData = data.map((item, index) => {
        return {
          ...item,
          fill: COLORS[index % COLORS.length],
        }
      })

      console.log("Processed data for charts:", processedData)
      setAssetCategories(processedData)

      // Get summary data from the first item (all items have the same summary data)
      if (data.length > 0) {
        setSummaryData({
          totalAssets: data.reduce((sum, item) => sum + (item.AssetCount || 0), 0),
          totalValue: data.reduce((sum, item) => sum + (item.CurrentTotalValue || 0), 0),
          averageValue:
            data.reduce((sum, item) => sum + (item.CurrentTotalValue || 0), 0) /
            data.reduce((sum, item) => sum + (item.AssetCount || 0), 0),
          categoriesCount: processedData.length,
          currentDate: new Date().toLocaleDateString(),
        })
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching asset categories:", error)
      setAssetCategories([])
      setSummaryData({
        totalAssets: 0,
        totalValue: 0,
        averageValue: 0,
        categoriesCount: 0,
        currentDate: new Date().toLocaleDateString(),
      })
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData(true) // Initial load with default filters
  }, [])

  // Handle refresh button click
  const handleRefresh = () => {
    fetchData(isFiltered)
  }

  // Handle apply filters button click
  const handleApplyFilters = () => {
    console.log("Applying filters with dates:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    })

    // Double-check that we're using the latest dates
    if (debugRef.current.lastStartDate) {
      setStartDate(debugRef.current.lastStartDate)
    }

    if (debugRef.current.lastEndDate) {
      setEndDate(debugRef.current.lastEndDate)
    }

    // Use setTimeout to ensure state updates before fetching
    setTimeout(() => {
      fetchData(true)
    }, 50)
  }

  // Replace the handleResetFilters function with this improved version
  const handleResetFilters = () => {
    const today = new Date()
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1) // January 1st of current year

    console.log("Resetting filters to:", {
      startDate: firstDayOfYear.toISOString(),
      endDate: today.toISOString(),
    })

    // Update debug ref
    debugRef.current.lastStartDate = firstDayOfYear
    debugRef.current.lastEndDate = today

    // Update state
    setStartDate(firstDayOfYear)
    setEndDate(today)

    // Use setTimeout to ensure state updates before fetching
    setTimeout(() => {
      fetchData(true)
    }, 50)
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-semibold text-gray-800">{payload[0].payload.CategoryName}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Count:</span> {payload[0].payload.AssetCount}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Value:</span> {formatCurrency(payload[0].payload.CurrentTotalValue)}
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
            <CardTitle className="text-3xl font-bold">{formatCurrency(summaryData.averageValue)}</CardTitle>
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
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                </div>
                <DatePicker
                  onChange={handleStartDateChange}
                  value={startDate}
                  format="y-MM-dd"
                  clearIcon={null}
                  calendarIcon={null}
                  className="w-full"
                  calendarClassName="shadow-lg border border-gray-200 rounded-lg"
                  inputClassName="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  dayPlaceholder="DD"
                  monthPlaceholder="MM"
                  yearPlaceholder="YYYY"
                />
              </div>
            </div>

            {/* End Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                </div>
                <DatePicker
                  onChange={handleEndDateChange}
                  value={endDate}
                  format="y-MM-dd"
                  clearIcon={null}
                  calendarIcon={null}
                  className="w-full"
                  calendarClassName="shadow-lg border border-gray-200 rounded-lg"
                  inputClassName="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  dayPlaceholder="DD"
                  monthPlaceholder="MM"
                  yearPlaceholder="YYYY"
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
                            dataKey="AssetCount"
                            nameKey="CategoryName"
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
                          <XAxis dataKey="CategoryName" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="AssetCount" name="Asset Count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}

                      {chartType === "line" && (
                        <AreaChart data={assetCategories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="CategoryName" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="AssetCount"
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
                            dataKey="CurrentTotalValue"
                            nameKey="CategoryName"
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
                          <XAxis dataKey="CategoryName" />
                          <YAxis tickFormatter={(value) => formatCurrency(value)} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="CurrentTotalValue" name="Asset Value" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}

                      {chartType === "line" && (
                        <AreaChart data={assetCategories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="CategoryName" />
                          <YAxis tickFormatter={(value) => formatCurrency(value)} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="CurrentTotalValue"
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

