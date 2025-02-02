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
  const [modals, setModals] = useState({
    add: false,
    update: false,
    delete: false,
    view: false,
    addQuantity: false,
    viewDepreciation: false,
  });
  const [selectedItem, setSelectedItem] = useState(null); // State for selected item
  const [depreciationData, setDepreciationData] = useState(null); // State for depreciation data
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
    DepreciationRate: 0, // Default numeric values to "0" or 0
    DepreciationValue: 0,
    DepreciationPeriodType: "month",
    DepreciationPeriodValue: 0,
  });

  const toggleModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  async function fetchDepreciationSchedule(assetId) {
    try {
      const response = await fetch(
        `${API_URL}ViewDepreciationSchedule?assetId=${assetId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDepreciationData(data);
    } catch (error) {
      console.error("Failed to fetch depreciation schedule:", error);
    }
  }

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

      const data = await response.json(); // Parse the JSON response
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
          assetCost: parseFloat(addItem.Cost) || 0,
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
          depreciationRate: parseFloat(addItem.DepreciationRate) || 0,
          depreciationValue: 0,
          depreciationPeriodType: addItem.DepreciationPeriodType || "year",
          depreciationPeriodValue:
            parseInt(addItem.DepreciationPeriodValue, 10) || 1,
          assetPreventiveMaintenace: "Quarterly",
        };
        // const formattedData = {
        //   assetQRCodeBase64: qrCodeBase64,
        //   categoryID: categoryId,
        //   assetName: addItem.AssetName,
        //   datePurchased: addItem.DatePurchased
        //     ? new Date(addItem.DatePurchased).toISOString()
        //     : null,
        //   dateIssued: addItem.DateIssued
        //     ? new Date(addItem.DateIssued).toISOString()
        //     : null,
        //   issuedTo: addItem.IssuedTo || "",
        //   checkedBy: addItem.CheckedBy || "",
        //   assetCost: parseFloat(addItem.Cost) || 0,
        //   assetCode: generatedAssetCode,
        //   remarks: addItem.Remarks || "",
        //   assetLocation: addItem.Location || "",
        //   warrantyStartDate: addItem.WarrantyStartDate
        //     ? new Date(addItem.WarrantyStartDate).toISOString()
        //     : null,
        //   warrantyExpirationDate: addItem.WarrantyExpirationDate
        //     ? new Date(addItem.WarrantyExpirationDate).toISOString()
        //     : "2028-01-29T05:52:52.544Z",
        //   warrantyVendor: addItem.WarrantyVendor || "",
        //   warrantyContact: addItem.WarrantyContact || "",
        //   assetStatus: addItem.AssetStatus || "Active",
        //   assetStype: addItem.AssetStype || "Electronics",
        //   assetPreventiveMaintenace: "Quarterly",
        //   notes: "For office use",
        //   depreciationRate: parseFloat(addItem.DepreciationRate) || 0,
        //   depreciationPeriodType: addItem.DepreciationPeriodType || "year",
        //   depreciationPeriodValue:
        //     parseInt(addItem.DepreciationPeriodValue, 10) || 1,
        // };

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

          <button onClick={handleAddAssetItem}>testing</button>

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
            <table className="min-w-full table-auto bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="table100-head" role="rowgroup">
                <tr>
                  <th className="py-3 px-6 text-left" scope="col">
                    Item ID
                  </th>
                  <th className="py-3 px-6 text-left" scope="col">
                    QR Code
                  </th>
                  <th className="py-3 px-6 text-left" scope="col">
                    Item Name
                  </th>

                  <th className="py-3 px-6 text-left" scope="col">
                    Issued To
                  </th>
                  <th className="py-3 px-6 text-left" scope="col">
                    Checked By
                  </th>
                  <th className="py-3 px-6 text-left" scope="col">
                    Cost
                  </th>
                  <th className="py-3 px-6 text-left" scope="col">
                    Location
                  </th>
                  <th className="py-3 px-6 text-left" scope="col">
                    Asset Code
                  </th>
                  <th className="py-3 px-6 text-left" scope="col">
                    Remarks
                  </th>
                  <th className="py-3 px-6 text-left" scope="col">
                    Date Purchased
                  </th>
                  <th className="py-3 px-6 text-left" scope="col">
                    QR Code
                  </th>
                  <th className="py-3 px-6 text-left" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm" role="rowgroup">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr
                      key={item.assetId || item.id}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-3 px-6">{item.assetId}</td>
                      <td className="py-3 px-6">
                        <div className="mt-4 flex justify-center" ref={qrRef}>
                          <QRCodeCanvas value={qrData} size={150} />
                        </div>
                      </td>
                      <td className="py-3 px-6">{item.assetName}</td>
                      <td className="py-3 px-6">{item.issuedTo}</td>
                      <td className="py-3 px-6">{item.checkedBy}</td>
                      <td className="py-3 px-6">{item.cost}</td>
                      <td className="py-3 px-6">{item.location}</td>
                      <td className="py-3 px-6">{item.assetCode}</td>
                      <td className="py-3 px-6">{item.remarks}</td>
                      <td className="py-3 px-6">{item.datePurchased}</td>
                      <td className="py-3 px-6">
                        {item.AssetQRCodePath && (
                          <img
                            src={item.AssetQRCodePath}
                            alt="QR Code"
                            className="w-12 h-12"
                          />
                        )}
                      </td>
                      <td className="py-3 px-6 flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            toggleModal("update");
                          }}
                          className="text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm px-4 py-1 flex items-center justify-center"
                          title="Edit Item"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            toggleModal("delete");
                          }}
                          className="text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm px-4 py-1 flex items-center justify-center"
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
                          className="text-white bg-blue-500 hover:bg-blue-600 rounded-lg text-sm px-4 py-1 flex items-center justify-center"
                          title="View Depreciation Schedule"
                        >
                          <i className="fa-solid fa-calendar"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center py-4">
                      No items in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {modals.add && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg w-11/12 md:w-1/2 p-6 relative">
                <span
                  className="absolute top-2 right-2 text-gray-600 cursor-pointer text-2xl font-bold"
                  onClick={() => toggleModal("add")}
                >
                  &times;
                </span>
                <h2 className="text-2xl mb-4 font-semibold text-center">
                  Add New Asset
                </h2>
                <form onSubmit={handleAddAssetItem} className="space-y-4">
                  {/* Asset Name and Category ID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">
                        Asset Name
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="text"
                          name="AssetName" // Matches backend: AssetName
                          value={addItem.AssetName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Category ID
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="number"
                          name="CategoryID" // Matches backend: CategoryID
                          value={categoryId}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date Purchased and Date Issued */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">
                        Date Purchased
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="date"
                          name="DatePurchased" // Matches backend: DatePurchased
                          value={addItem.DatePurchased}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Date Issued
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="date"
                          name="DateIssued" // Matches backend: DateIssued
                          value={addItem.DateIssued}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Issued To and Checked By */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">
                        Issued To
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="text"
                          name="IssuedTo" // Matches backend: IssuedTo
                          value={addItem.IssuedTo}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Checked By
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="text"
                          name="CheckedBy" // Matches backend: CheckedBy
                          value={addItem.CheckedBy}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Asset Cost, Location, and Vendor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">
                        Asset Cost
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="number"
                          step="0.01"
                          name="AssetCost" // Matches backend: AssetCost
                          value={addItem.AssetCost}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Location
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="text"
                          name="AssetLocation" // Matches backend: AssetLocation
                          value={addItem.AssetLocation}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Asset Vendor
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="text"
                          name="AssetVendor" // Matches backend: AssetVendor
                          value={addItem.AssetVendor}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* QR Code, Remarks, and Asset Code */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium">
                        Asset QR Code Path
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="text"
                          name="AssetQRCodePath" // Matches backend: AssetQRCodePath
                          value={addItem.AssetQRCodePath}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Remarks
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="text"
                          name="Remarks" // Matches backend: Remarks
                          value={addItem.Remarks}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Warranty Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium">
                        Warranty Vendor
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="text"
                          name="WarrantyVendor" // Matches backend: WarrantyVendor
                          value={addItem.WarrantyVendor}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Warranty Contact
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="text"
                          name="WarrantyContact" // Matches backend: WarrantyContact
                          value={addItem.WarrantyContact}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Warranty Start Date
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="date"
                          name="WarrantyStartDate" // Matches backend: WarrantyStartDate
                          value={addItem.WarrantyStartDate}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Depreciation Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium">
                        Depreciation Rate (%)
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="number"
                          step="0.01"
                          name="DepreciationRate" // Matches backend: DepreciationRate
                          value={addItem.DepreciationRate}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Depreciation Period Type
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <select
                          name="DepreciationPeriodType" // Matches backend: DepreciationPeriodType
                          value={addItem.DepreciationPeriodType}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        >
                          <option value="month">Month</option>
                          <option value="year">Year</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Depreciation Period Value
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="number"
                          name="DepreciationPeriodValue" // Matches backend: DepreciationPeriodValue
                          value={addItem.DepreciationPeriodValue}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Add Asset
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
