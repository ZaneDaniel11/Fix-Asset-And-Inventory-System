import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import { format } from "date-fns";

// import { fetchData } from "../utilities/ApiUti";
const API_URL = "http://localhost:5075/api/AssetItemApi/";

export default function Inventory_table() {
  const location = useLocation();
  const qrRef = useRef(null);
  const navigate = useNavigate();
  const { selectedCategory } = location.state || {};
  const categoryId = selectedCategory?.categoryId;
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [transferData, setTransferData] = useState({
    newIssuedTo: "",
    newLocation: "",
  });
  const [modals, setModals] = useState({
    add: false,
    update: false,
    delete: false,
    view: false,
    addQuantity: false,
    viewDepreciation: false,
    transfer: false,
    viewHistory: false,
  });
  const [depreciationData, setDepreciationData] = useState(null);
  const [loadingDepreciation, setLoadingDepreciation] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null); // State for selected item
  // State for depreciation data
  const [addItem, setAddItem] = useState({
    categoryID: "",
    AssetName: "",
    DatePurchased: "",
    DateIssued: "",
    IssuedTo: "",
    CheckedBy: "",
    Cost: 0, // Ensure default number fields are strings or 0
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
    DepreciationRate: "", // Default numeric values to "0" or 0
    DepreciationValue: "",
    DepreciationPeriodType: "month",
    DepreciationPeriodValue: 0,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMMM dd, yyyy"); // e.g., July 23, 2205
  };

  // Function to calculate current asset value
  const calculateCurrentValue = (cost, rate, purchaseDate) => {
    if (!cost || !rate || !purchaseDate) return cost;

    const purchase = new Date(purchaseDate);
    const today = new Date();
    const yearsElapsed = (today - purchase) / (1000 * 60 * 60 * 24 * 365);

    let depreciationAmount = (rate / 100) * cost * yearsElapsed;
    return Math.max(1, (cost - depreciationAmount).toFixed(2)); // Prevent negative values
  };
  const toggleModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: !prev[type] }));
  };
  const fetchDepreciationSchedule = async (assetId) => {
    setLoadingDepreciation(true);
    try {
      const response = await fetch(
        `${API_URL}ViewDepreciationSchedule?assetId=${assetId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch depreciation schedule");
      }
      const data = await response.json();
      console.log(data);
      setDepreciationData(data);
    } catch (error) {
      console.error("Error fetching depreciation schedule:", error);
      setDepreciationData(null);
    } finally {
      setLoadingDepreciation(false);
    }
  };

  const openHistoryModal = async (assetID) => {
    console.log(`🔍 Fetching history for asset ID: ${assetID}`);

    try {
        const response = await fetch(`http://localhost:5075/api/AssetHistoryApi/viewHistorical?assetID=${assetID}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ History Data:", data);
        setHistoryData(data); // Assuming you have state for this
        toggleModal("viewHistory"); // Open modal
    } catch (error) {
        console.error("❌ Error fetching history:", error);
    }
};

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setAddItem((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? parseFloat(value) : 0) : value,
    }));
  };

  useEffect(() => {
    if (!categoryId) {
      alert("No category selected, redirecting to categories page.");
      navigate("/categories");
    } else {
      fetchItems(categoryId);
    }
  }, [categoryId, navigate]);

  const fetchItems = async (categoryId) => {
    try {
      const response = await fetch(
        `${API_URL}GetAssetsByCategory?categoryID=${categoryId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setItems(data);
      setFilteredItems(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch items", error);
      setLoading(false);
    }
  };

  const generateAssetCode = () => {
    return `ASSET-${categoryId}-${Date.now()}`;
  };
  const convertCanvasToBase64 = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    return canvas ? canvas.toDataURL("image/png") : "";
  };

  const handleViewAsset = (item) => {
    setSelectedItem(item); // Store selected item
    toggleModal("view"); // Open the view modal
    console.log(item);
  };
  const toggleTransferModal = () => {
    setModals((prev) => ({
      ...prev,
      transfer: !prev.transfer,
      view: false, // Close the view modal when opening the transfer modal
    }));
  };

  const handleTransfer = async () => {
    const storedName = localStorage.getItem("name");
    if (!transferData.newIssuedTo || !transferData.newLocation) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5075/api/AssetItemApi/TransferAsset",
        {
          AssetID: selectedItem.assetId,
          NewOwner: transferData.newIssuedTo,
          NewLocation: transferData.newLocation,
          Remarks: selectedItem.remarks,
          performedBy: storedName,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      alert("Asset transferred successfully!");
      setModals((prev) => ({ ...prev, transfer: false })); // Close transfer modal
      fetchAssets(); // Refresh asset list
    } catch (error) {
      console.error("Error transferring asset:", error);
      alert("Transfer failed.");
    }
  };
  const handleAddAssetItem = async (e) => {
    e.preventDefault();

    try {
      const generatedAssetCode = generateAssetCode();
      setQrData(generatedAssetCode);

      setTimeout(async () => {
        const qrCodeBase64 = convertCanvasToBase64();
        const formattedData = {
          assetQRCodeBase64: qrCodeBase64,
          categoryID: categoryId,
          assetName: addItem.AssetName,
          assetPicture: "images/assets/dell_latitude_5520.png",
          datePurchased: addItem.DatePurchased
            ? new Date(addItem.DatePurchased).toISOString()
            : null,
          dateIssued: addItem.DateIssued
            ? new Date(addItem.DateIssued).toISOString()
            : null,
          issuedTo: addItem.IssuedTo || "",
          checkedBy: addItem.CheckedBy || "",
          assetCost: parseFloat(addItem.AssetCost) || 0,
          assetCode: generatedAssetCode,
          remarks: addItem.Remarks || "",
          assetLocation: addItem.Location || "",
          assetVendor: "Dell Technologies",
          warrantyStartDate: addItem.WarrantyStartDate
            ? new Date(addItem.WarrantyStartDate).toISOString()
            : null,
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
          depreciationPeriodValue:
            parseInt(addItem.DepreciationPeriodValue, 10) || 1,
          assetPreventiveMaintenace: "Quarterly",
        };

        console.log("Sending Data:", formattedData);

        const response = await axios.post(
          `${API_URL}InsertAsset`,
          formattedData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        console.log("Asset added successfully:", response.data);

        toggleModal("add");
        fetchItems(categoryId);
      }, 500);
    } catch (error) {
      console.error("Failed to add asset item", error);
    }
  };

  return (
    <div>
      <div className="limiter w-full">
        <div className="container mx-auto p-6">
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-700 ">
              Items in {selectedCategory?.categoryName || "All Categories"}
            </h2>
          </div>

          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex justify-between items-center">
            <button
              onClick={() => toggleModal("add")}
              className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
            >
              <i className="fa-solid fa-plus"></i> Add Asset Item
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="w-full border-collapse rounded-lg shadow-md overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  {[
                    "Item ID",
                    "QR Code",
                    "Item Name",
                    "Issued To",
                    "Checked By",
                    "Cost",
                    "Location",
                    "Asset Code",
                    "Remarks",
                    "Date Purchased",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="py-3 px-4 text-left border border-gray-700"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="text-gray-800 bg-gray-100">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr
                      key={item.assetId || item.id}
                      className="border-b border-gray-300 hover:bg-gray-200 transition-all"
                    >
                      <td className="py-3 px-4 border">{item.assetId}</td>

                      {/* QR Code Display */}
                      <td className="py-3 px-4 border flex justify-center items-center">
                        {item.AssetQRCodePath ? (
                          <img
                            src={item.AssetQRCodePath}
                            alt="QR Code"
                            className="w-12 h-12"
                          />
                        ) : (
                          <QRCodeCanvas value={qrData} size={50} />
                        )}
                      </td>

                      <td className="py-3 px-4 border">{item.assetName}</td>
                      <td className="py-3 px-4 border">{item.issuedTo}</td>
                      <td className="py-3 px-4 border">{item.checkedBy}</td>
                      <td className="py-3 px-4 border">{item.assetCost}</td>
                      <td className="py-3 px-4 border">{item.assetLocation}</td>
                      <td className="py-3 px-4 border">{item.assetCode}</td>
                      <td className="py-3 px-4 border">{item.remarks}</td>
                      <td className="py-3 px-4 border">{item.datePurchased}</td>

                      {/* Actions Buttons */}
                      <td className="py-3 px-4 border">
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button
                            onClick={() => handleViewAsset(item)}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-md text-sm px-3 py-2 transition-all"
                            title="View Asset"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              toggleModal("update");
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-md text-sm px-3 py-2 transition-all"
                            title="Edit Item"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItem(item);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-md text-sm px-3 py-2 transition-all"
                            title="Delete Item"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              fetchDepreciationSchedule(item.assetId);
                              toggleModal("viewDepreciation");
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm px-3 py-2 transition-all"
                            title="View Depreciation Schedule"
                          >
                            <i className="fa-solid fa-calendar"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center py-4 text-gray-600">
                      No items in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {modals.add && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-2xl shadow-lg w-11/12 md:w-3/4 lg:w-1/2 max-h-screen overflow-y-auto p-8 relative">
                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={() => toggleModal("add")}
                >
                  &times;
                </button>

                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
                  Add New Asset
                </h2>

                <form onSubmit={handleAddAssetItem} className="space-y-6">
                  {/* Asset Name & Category ID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Asset Name
                      </label>
                      <input
                        type="text"
                        name="AssetName"
                        value={addItem.AssetName}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Category ID
                      </label>
                      <input
                        type="number"
                        name="CategoryID"
                        value={categoryId}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Date Purchased & Issued */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Date Purchased
                      </label>
                      <input
                        type="date"
                        name="DatePurchased"
                        value={addItem.DatePurchased}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Date Issued
                      </label>
                      <input
                        type="date"
                        name="DateIssued"
                        value={addItem.DateIssued}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Issued To & Checked By */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Issued To
                      </label>
                      <input
                        type="text"
                        name="IssuedTo"
                        value={addItem.IssuedTo}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Checked By
                      </label>
                      <input
                        type="text"
                        name="CheckedBy"
                        value={addItem.CheckedBy}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Asset Cost, Location & Vendor */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Asset Cost
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="AssetCost"
                        value={addItem.AssetCost}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        name="AssetLocation"
                        value={addItem.AssetLocation}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Asset Vendor
                      </label>
                      <input
                        type="text"
                        name="AssetVendor"
                        value={addItem.AssetVendor}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Remarks
                    </label>
                    <textarea
                      name="Remarks"
                      value={addItem.Remarks}
                      onChange={handleInputChange}
                      className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Depreciation Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Depreciation Rate (%)
                      </label>
                      <input
                        type="number"
                        name="DepreciationRate"
                        value={addItem.DepreciationRate}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Depreciation Period Type
                      </label>
                      <select
                        name="DepreciationPeriodType"
                        value={addItem.DepreciationPeriodType}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Depreciation Period Value
                      </label>
                      <input
                        type="number"
                        name="DepreciationPeriodValue"
                        value={addItem.DepreciationPeriodValue}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* ASSET WARANTY AREA */}
                  {/* Warranty Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Warranty Start Date
                      </label>
                      <input
                        type="date"
                        name="WarrantyStartDate"
                        value={addItem.WarrantyStartDate}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Warranty Expiration Date
                      </label>
                      <input
                        type="date"
                        name="WarrantyExpirationDate"
                        value={addItem.WarrantyExpirationDate}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Warranty Vendor
                      </label>
                      <input
                        type="text"
                        name="WarrantyVendor"
                        value={addItem.WarrantyVendor}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Warranty Contact
                      </label>
                      <input
                        type="text"
                        name="WarrantyContact"
                        value={addItem.WarrantyContact}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    Add Asset
                  </button>
                </form>
              </div>
            </div>
          )}

          {modals.view && selectedItem && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md animate-slideIn">
              <div className="bg-white p-8 rounded-3xl shadow-xl w-[750px] relative">
                {/* Header with "View More" Button */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    📌 Asset Overview
                  </h2>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-500 hover:text-blue-700 font-semibold"
                  >
                    {isExpanded ? "Hide Details ⬆️" : "View More ⬇️"}
                  </button>
                </div>

                {/* Basic Details & QR Code */}
                <div className="flex items-center space-x-6 mb-6">
                  {/* QR Code */}
                  <div className="p-4 bg-gray-100 rounded-xl shadow-md">
                    <QRCodeCanvas value={selectedItem.assetCode} size={130} />
                  </div>

                  {/* Essential Asset Information */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {selectedItem.assetName}
                    </h3>
                    <p className="text-lg text-green-600 font-bold">
                      💰 Cost:{" "}
                      <span className="text-gray-800">
                        ${selectedItem.assetCost}
                      </span>
                    </p>
                    <p className="text-lg text-blue-600 font-bold">
                      📉 Current Value ({formatDate(new Date())}):
                      <span className="text-gray-800">
                        {" "}
                        $
                        {calculateCurrentValue(
                          selectedItem.assetCost,
                          selectedItem.depreciationRate,
                          selectedItem.datePurchased
                        )}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Expanded Section (Collapsible) */}
                {isExpanded && (
                  <div className="grid grid-cols-2 gap-6 text-gray-700 text-lg mb-6 animate-fadeIn">
                    {[
                      ["Asset Code", selectedItem.assetCode],
                      ["Issued To", selectedItem.issuedTo],
                      ["Vendor", selectedItem.assetVendor],
                      ["Checked By", selectedItem.checkedBy],
                      ["Location", selectedItem.assetLocation],
                      ["Remarks", selectedItem.remarks],
                      [
                        "Warranty Start",
                        formatDate(selectedItem.warrantyStartDate),
                      ],
                      [
                        "Warranty Expiry",
                        formatDate(selectedItem.warrantyExpirationDate),
                      ],
                      ["Warranty Vendor", selectedItem.warrantyVendor],
                      ["Warranty Contact", selectedItem.warrantyContact],
                      ["Asset Type", selectedItem.assetStype],
                      [
                        "Preventive Maintenance",
                        selectedItem.assetPreventiveMaintenace,
                      ],
                      ["Notes", selectedItem.notes],
                      [
                        "Operation Start",
                        formatDate(selectedItem.operationStartDate),
                      ],
                      [
                        "Operation End",
                        formatDate(selectedItem.operationEndDate),
                      ],
                      ["Disposal Date", formatDate(selectedItem.disposalDate)],
                      [
                        "Depreciation Rate",
                        selectedItem.depreciationRate
                          ? `${selectedItem.depreciationRate}%`
                          : "N/A",
                      ],
                      [
                        "Depreciation Period",
                        selectedItem.depreciationPeriodValue || "N/A",
                      ],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between">
                        <span className="font-medium text-gray-900">
                          {label}:
                        </span>
                        <span>{value || "N/A"}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Badge */}
                <div className="mt-4 flex justify-between items-center">
                  <span className="font-medium text-gray-900">Status:</span>
                  <span
                    className={`px-5 py-2 text-md font-semibold rounded-full shadow-sm transition ${
                      selectedItem.assetStatus === "Active"
                        ? "bg-green-200 text-green-800"
                        : selectedItem.assetStatus === "In Use"
                        ? "bg-blue-200 text-blue-800"
                        : selectedItem.assetStatus === "Maintenance"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {selectedItem.assetStatus}
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => toggleModal("view")}
                    className="bg-red-500 hover:bg-red-600 text-white text-lg px-6 py-3 rounded-lg transition shadow-md"
                  >
                    Close
                  </button>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => toggleModal("transfer")}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white text-lg px-6 py-3 rounded-lg transition shadow-md"
                    >
                      Transfer Asset
                    </button>
                    <button onClick={() => {
                        console.log("🔍 Selected Item:", selectedItem);
                        if (selectedItem?.assetId) {
                            openHistoryModal(selectedItem.assetId);
                        } else {
                            console.error("🚨 Asset ID is missing from selectedItem!");
                        }
                    }}>
                        View History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

{modals.viewHistory && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-w-full">
      <h2 className="text-2xl font-bold text-gray-800">Asset History</h2>

      {/* Table Container */}
      <div className="mt-4 max-h-96 overflow-y-auto border rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Action</th>
              <th className="p-2">Performed By</th>
              <th className="p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {historyData.length > 0 ? (
              historyData.map((entry) => (
                <tr
                  key={entry.historyID} // ✅ FIXED: `historyID` instead of `HistoryID`
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-2">
                    {new Date(entry.actionDate).toLocaleDateString()} 
                    {/* ✅ FIXED: `actionDate` instead of `ActionDate` */}
                  </td>
                  <td className="p-2 font-semibold text-blue-600">
                    {entry.actionType} 
                    {/* ✅ FIXED: `actionType` instead of `ActionType` */}
                  </td>
                  <td className="p-2">{entry.performedBy} 
                    {/* ✅ FIXED: `performedBy` instead of `PerformedBy` */}
                  </td>
                  <td className="p-2">{entry.remarks || "N/A"} 
                    {/* ✅ FIXED: `remarks` instead of `Remarks` */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Close Button */}
      <div className="mt-4 flex justify-end">
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          onClick={() => setModals({ ...modals, viewHistory: false })}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

              
          {/* Transfer Modal */}
          {modals.transfer && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
              <div className="bg-white p-8 rounded-2xl shadow-2xl w-[400px] relative">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  🔄 Transfer Asset
                </h2>

                <label className="block text-lg font-medium text-gray-700 mb-2">
                  New Issued To:
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded-lg mb-4"
                  value={transferData.newIssuedTo}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      newIssuedTo: e.target.value,
                    })
                  }
                />

                <label className="block text-lg font-medium text-gray-700 mb-2">
                  New Location:
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded-lg mb-4"
                  value={transferData.newLocation}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      newLocation: e.target.value,
                    })
                  }
                />

                <div className="flex justify-between">
                  <button
                    onClick={toggleTransferModal}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransfer}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200"
                  >
                    Confirm Transfer
                  </button>
                </div>
              </div>
            </div>
          )}


          {modals.viewDepreciation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-2xl shadow-lg w-11/12 md:w-1/2 p-8 relative">
                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={() => toggleModal("viewDepreciation")}
                >
                  &times;
                </button>

                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
                  Depreciation Schedule
                </h2>

                {loadingDepreciation ? (
                  <p className="text-center text-gray-600">Loading...</p>
                ) : depreciationData ? (
                  <table className="w-full border-collapse rounded-lg shadow-md">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="py-3 px-4 border">Date</th>
                        <th className="py-3 px-4 border">Year</th>
                        <th className="py-3 px-4 border">
                          Depreciation Amount
                        </th>
                        <th className="py-3 px-4 border">Remaining Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depreciationData.map((entry, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-300 hover:bg-gray-200"
                        >
                          {/* Format the date */}
                          <td className="py-3 px-4 border">
                            {new Date(
                              entry.DepreciationDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4 border">
                            {new Date(
                              entry.DepreciationDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4 border">
                            {entry.DepreciationValue}
                          </td>
                          <td className="py-3 px-4 border">
                            {entry.RemainingValue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-gray-600">
                    No depreciation data available.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
