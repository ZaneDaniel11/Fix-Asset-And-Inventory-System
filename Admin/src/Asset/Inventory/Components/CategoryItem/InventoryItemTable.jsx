import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

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
      await axios.post("http://localhost:5075/api/AssetItemApi/TransferAsset", 
        {
          AssetID: selectedItem.assetId,
          NewOwner: transferData.newIssuedTo,
          NewLocation: transferData.newLocation,
          Remarks: selectedItem.remarks,
          performedBy:storedName
        }, 
        {
          headers: { "Content-Type": "application/json" }
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
                              setSelectedItem(item)
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
            <label className="text-sm font-medium text-gray-700">Warranty Start Date</label>
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
            <label className="text-sm font-medium text-gray-700">Warranty Expiration Date</label>
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
            <label className="text-sm font-medium text-gray-700">Warranty Vendor</label>
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
            <label className="text-sm font-medium text-gray-700">Warranty Contact</label>
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

     {/* Asset Details Modal */}
{modals.view && selectedItem && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-[480px] relative">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        📌 Asset Details
      </h2>

      <div className="flex items-center space-x-6 mb-6">
        {/* QR Code */}
        <div className="p-3 bg-gray-100 rounded-lg shadow-md">
          <QRCodeCanvas value={selectedItem.assetCode} size={100} />
        </div>

        <div className="space-y-2">
          <div className="text-xl font-semibold text-gray-900">
            {selectedItem.assetName}
          </div>
          <div className="text-lg text-green-600 font-bold">
            ${selectedItem.assetCost}
          </div>
        </div>
      </div>

      <hr className="border-gray-300 mb-4" />

      {/* Asset Information */}
      <div className="space-y-4 text-gray-700 text-lg">
        <div className="flex justify-between">
          <span className="font-medium text-gray-900">Asset Code:</span>
          <span>{selectedItem.assetCode}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-900">Location:</span>
          <span>{selectedItem.assetLocation}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-900">Issued To:</span>
          <span>{selectedItem.issuedTo}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-900">Checked By:</span>
          <span>{selectedItem.checkedBy}</span>
        </div>
        {/* Asset Status */}
        <div className="flex justify-between items-center">
  <span className="font-medium text-gray-900">Status:</span>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
              selectedItem.assetStatus === "Available"
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
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => toggleModal("view")}
          className="bg-red-500 hover:bg-red-600 text-white text-lg px-6 py-3 rounded-lg transition duration-200 shadow-md"
        >
          Close
        </button>
        <button
          onClick={toggleTransferModal}
          className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-6 py-3 rounded-lg transition duration-200 shadow-md"
        >
          Transfer
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
                setTransferData({ ...transferData, newIssuedTo: e.target.value })
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
                setTransferData({ ...transferData, newLocation: e.target.value })
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
