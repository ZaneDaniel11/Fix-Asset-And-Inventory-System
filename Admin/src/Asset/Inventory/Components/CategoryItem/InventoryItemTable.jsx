import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QRCode from "qrcode"; // Import QR code library

const API_URL = "http://localhost:5075/api/AssetItemApi/";

export default function Inventory_table() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCategory } = location.state || {};
  const categoryId = selectedCategory?.categoryId;
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modals, setModals] = useState({
    add: false,
    update: false,
    delete: false,
    view: false,
    addQuantity: false,
    viewDepreciation: false,
  });
  const [addItem, setAddItem] = useState({
    AssetName: "",
    AssetQRCodePath: "",
    AssetQRCodeBlob: "",
    DatePurchased: "",
    DateIssued: "",
    IssuedTo: "",
    CheckedBy: "",
    Cost: "",
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
    DepreciationPeriodValue: "",
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
      console.log(data);
      setDepreciationData(data); // Use state to store fetched depreciation data
    } catch (error) {
      console.error("Failed to fetch depreciation schedule:", error);
    }
  }

  useEffect(() => {
    if (categoryId) {
      fetchItems(categoryId);
    } else {
      alert("No category selected, redirecting to categories page.");
      navigate("/categories");
    }
  }, [categoryId, navigate]);

  const fetchItems = async (categoryId) => {
    try {
      const result = await fetchData(
        `${API_URL}GetAssetsByCategory?categoryID=${categoryId}`,
        "GET"
      );
      setItems(result);
      setFilteredItems(result);
      console.log(result);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch items", error);
      setLoading(false);
    }
  };
  const generateQRCode = async (data) => {
    try {
      return await QRCode.toDataURL(data);
    } catch (error) {
      console.error("Failed to generate QR code", error);
      return "";
    }
  };
  const generateAssetCode = () => {
    // Example: Generate a code using a timestamp and category ID
    return `ASSET-${categoryId}-${Date.now()}`;
  };
  const handleAddAssetItem = async (e) => {
    e.preventDefault();

    try {
      const assetCode = generateAssetCode(); // Generate AssetCode
      const qrCodeBlob = await generateQRCode(assetCode); // Generate QR code as Base64 string

      const newAsset = {
        categoryID: categoryId,
        assetName: addItem.AssetName,
        assetQRCodePath: addItem.AssetQRCodePath,
        assetQRCodeBlob: qrCodeBlob, // Use the generated QR code
        datePurchased: addItem.DatePurchased,
        dateIssued: addItem.DateIssued,
        issuedTo: addItem.IssuedTo,
        checkedBy: addItem.CheckedBy,
        cost: parseFloat(addItem.Cost),
        location: addItem.Location,
        assetCode: assetCode, // Use the generated AssetCode
        remarks: addItem.Remarks,
        warrantyStartDate: addItem.WarrantyStartDate,
        warrantyExpirationDate: addItem.WarrantyExpirationDate,
        warrantyVendor: addItem.WarrantyVendor,
        warrantyContact: addItem.WarrantyContact,
        assetStatus: addItem.AssetStatus,
        assetType: addItem.AssetType,
        assetStype: addItem.AssetStype,
        preventiveMaintenanceSchedule: addItem.PreventiveMaintenanceSchedule,
        depreciationRate: parseFloat(addItem.DepreciationRate),
        depreciationValue: parseFloat(addItem.DepreciationValue),
        depreciationPeriodType: addItem.DepreciationPeriodType,
        depreciationPeriodValue: parseInt(addItem.DepreciationPeriodValue),
      };

      await fetchData(`${API_URL}InsertAsset`, "POST", { newAsset });

      toggleModal("add");
      fetchItems(categoryId);
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
            <table className="min-w-full table-auto bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="table100-head" role="rowgroup">
                <tr>
                  <th className="py-3 px-6 text-left" scope="col">
                    Item ID
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
                      <td className="py-3 px-6">{item.assetName}</td>
                      <td className="py-3 px-6">{item.issuedTo}</td>
                      <td className="py-3 px-6">{item.checkedBy}</td>
                      <td className="py-3 px-6">{item.cost}</td>
                      <td className="py-3 px-6">{item.location}</td>
                      <td className="py-3 px-6">{item.assetCode}</td>
                      <td className="py-3 px-6">{item.remarks}</td>
                      <td className="py-3 px-6">{item.datePurchased}</td>
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
                    <td colSpan="10" className="text-center py-4">
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
                          name="AssetName"
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
                          name="CategoryID"
                          value={addItem.CategoryID}
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
                          name="DatePurchased"
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
                          name="DateIssued"
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
                          name="IssuedTo"
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
                          name="CheckedBy"
                          value={addItem.CheckedBy}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cost and Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Cost</label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="number"
                          name="Cost"
                          value={addItem.Cost}
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
                          name="Location"
                          value={addItem.Location}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Asset Code and Remarks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">
                        Asset Code
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <input
                          type="text"
                          name="AssetCode"
                          value={addItem.AssetCode}
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
                          name="Remarks"
                          value={addItem.Remarks}
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
                          name="DepreciationRate"
                          value={addItem.DepreciationRate}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Depreciation Period Type
                      </label>
                      <div className="border-2 border-black rounded-md">
                        <select
                          name="DepreciationPeriodType"
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
                          name="DepreciationPeriodValue"
                          value={addItem.DepreciationPeriodValue}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border-black rounded-md"
                          required
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
