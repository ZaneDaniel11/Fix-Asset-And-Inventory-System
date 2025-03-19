import { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "../../Components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../../Components/ui/select";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

const ReportDashboard = () => {
  const [reportType, setReportType] = useState("warranty");
  const [dateRange, setDateRange] = useState(null);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const mockData = [
    { name: "Laptop", value: 30 },
    { name: "Monitor", value: 20 },
    { name: "Printer", value: 10 },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 text-center">
        Asset Reports
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 shadow-lg rounded-2xl">
        {/* Report Type Selection */}
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-full bg-gray-200 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-300 transition">
            {reportType ? reportType.charAt(0).toUpperCase() + reportType.slice(1) : "Select Report Type"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="warranty">Asset Warranty</SelectItem>
            <SelectItem value="maintenance">Asset Maintenance</SelectItem>
            <SelectItem value="depreciation">Asset Depreciation</SelectItem>
            <SelectItem value="transfer">Asset Transfer</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Picker (Hidden for Depreciation) */}
        {reportType !== "depreciation" && (
          <div className="bg-gray-200 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-300 transition">
            <DatePicker
              onChange={setDateRange}
              value={dateRange}
              format="y-MM-dd"
              clearIcon={null}
              calendarIcon={null}
            />
          </div>
        )}

        {/* Category Selection (For Maintenance & Depreciation) */}
        {(reportType === "maintenance" || reportType === "depreciation") && (
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full bg-gray-200 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-300 transition">
              {category || "Select Category"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Location Selection (For Transfer) */}
        {reportType === "transfer" && (
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-full bg-gray-200 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-300 transition">
              {location || "Select Location"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Chart Display */}
      <Card className="shadow-lg rounded-2xl p-4 bg-white">
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {reportType === "warranty" && (
              <PieChart>
                <Pie
                  data={mockData}
                  dataKey="value"
                  nameKey="name"
                  fill="#4F46E5"
                  label
                />
                <Tooltip />
              </PieChart>
            )}

            {reportType === "maintenance" && (
              <LineChart data={mockData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            )}

            {reportType === "depreciation" && (
              <BarChart data={mockData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#F59E0B" barSize={40} radius={[5, 5, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDashboard;
