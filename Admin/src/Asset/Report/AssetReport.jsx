import { useState } from "react";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectItem } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";

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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Asset Reports</h1>

      <div className="flex space-x-4">
        <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <SelectItem value="warranty">Asset Warranty</SelectItem>
          <SelectItem value="maintenance">Asset Maintenance</SelectItem>
          <SelectItem value="depreciation">Asset Depreciation</SelectItem>
          <SelectItem value="transfer">Asset Transfer</SelectItem>
        </Select>

        {reportType !== "depreciation" && <DatePicker value={dateRange} onChange={setDateRange} />}

        {(reportType === "maintenance" || reportType === "depreciation") && (
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="furniture">Furniture</SelectItem>
          </Select>
        )}

        {reportType === "transfer" && (
          <Select value={location} onChange={(e) => setLocation(e.target.value)}>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="warehouse">Warehouse</SelectItem>
          </Select>
        )}
      </div>

      <Card>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {reportType === "warranty" && (
              <PieChart>
                <Pie data={mockData} dataKey="value" nameKey="name" fill="#82ca9d" label />
                <Tooltip />
              </PieChart>
            )}

            {reportType === "maintenance" && (
              <LineChart data={mockData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            )}

            {reportType === "depreciation" && (
              <BarChart data={mockData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDashboard;
