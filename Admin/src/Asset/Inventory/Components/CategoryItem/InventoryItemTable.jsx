import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5075/api/AssetItemApi/";

const fetchData = async (url, method = "GET", body = null) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return await response.json();
};

export default function Inventory_table() {
  const location = useLocation();
  const navigate = useNavigate(); // Use navigate to redirect if necessary
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
  });
  const [selectedItem, setSelectedItem] = useState(null);

  const [addItem, setAddItem] = useState({
    AssetName: "",
    DatePurchased: "",
    DateIssued: "",
    IssuedTo: "",
    CheckedBy: "",
    Cost: "",
    Location: "",
    AssetCode: "",
    Remarks: "",
    DepreciationPeriodType: "month",
    DepreciationPeriodValue: "",
    DepreciationRate: "",
  });

  const toggleModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: !prev[type] }));
  };

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

  const handleAddAssetItem = async (e) => {
    e.preventDefault();

    try {
      await fetchData(`${API_URL}InsertAsset`, "POST", {
        categoryID: categoryId,
        assetName: addItem.AssetName,
        datePurchased: addItem.DatePurchased,
        dateIssued: addItem.DateIssued,
        issuedTo: addItem.IssuedTo,
        checkedBy: addItem.CheckedBy,
        cost: parseFloat(addItem.Cost),
        location: addItem.Location,
        assetCode: addItem.AssetCode,
        remarks: addItem.Remarks,
        depreciationRate: parseFloat(addItem.DepreciationRate),
        depreciationValue: parseFloat(addItem.Cost),
        depreciationPeriodType: addItem.DepreciationPeriodType,
        depreciationPeriodValue: parseInt(addItem.DepreciationPeriodValue),
      });

      toggleModal("add");
      fetchItems(categoryId); // Refresh the list of items using the correct categoryId
    } catch (error) {
      console.error("Failed to add asset item", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddItem((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="limiter">
        <div className="container-table100">
          <div className="wrap-table100">
            <div className="table100">
              <div className="flex justify-between mb-4">
                <h2 className="text-2xl mb-4">
                  Items in {selectedCategory?.categoryName || "All Categories"}
                </h2>
                <button
                  onClick={() => toggleModal("add")}
                  className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
                >
                  <i className="fa-solid fa-plus"></i> Add Item
                </button>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : (
                <table className="min-w-full table-auto bg-white shadow-md rounded-lg overflow-hidden">
                  <thead className="table100-head">
                    <tr className="">
                      <th className="py-3 px-6 text-left">Item ID</th>
                      <th className="py-3 px-6 text-left">Item Name</th>
                      <th className="py-3 px-6 text-left">Issued To</th>
                      <th className="py-3 px-6 text-left">Checked By</th>
                      <th className="py-3 px-6 text-left">Cost</th>
                      <th className="py-3 px-6 text-left">Location</th>
                      <th className="py-3 px-6 text-left">Asset Code</th>
                      <th className="py-3 px-6 text-left">Remarks</th>
                      <th className="py-3 px-6 text-left">DatePurchase</th>
                      <th className="py-3 px-6 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <tr
                          key={item.itemID}
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
                              className="text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm px-4 py-1"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                toggleModal("delete");
                              }}
                              className="text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm px-4 py-1"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                toggleModal("addQuantity");
                              }}
                              className="text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg text-sm px-4 py-1"
                            >
                              <i className="fa-solid fa-plus"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
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
                          <input
                            type="text"
                            name="AssetName"
                            value={addItem.AssetName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>

                      {/* Date Purchased and Date Issued */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium">
                            Date Purchased
                          </label>
                          <input
                            type="date"
                            name="DatePurchased"
                            value={addItem.DatePurchased}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">
                            Date Issued
                          </label>
                          <input
                            type="date"
                            name="DateIssued"
                            value={addItem.DateIssued}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      {/* Issued To and Checked By */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium">
                            Issued To
                          </label>
                          <input
                            type="text"
                            name="IssuedTo"
                            value={addItem.IssuedTo}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">
                            Checked By
                          </label>
                          <input
                            type="text"
                            name="CheckedBy"
                            value={addItem.CheckedBy}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      {/* Cost and Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium">
                            Cost
                          </label>
                          <input
                            type="number"
                            name="Cost"
                            value={addItem.Cost}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">
                            Location
                          </label>
                          <input
                            type="text"
                            name="Location"
                            value={addItem.Location}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      {/* Asset Code and Remarks */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium">
                            Asset Code
                          </label>
                          <input
                            type="text"
                            name="AssetCode"
                            value={addItem.AssetCode}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">
                            Remarks
                          </label>
                          <input
                            type="text"
                            name="Remarks"
                            value={addItem.Remarks}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      {/* Depreciation Rate and Depreciation Period */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium">
                            Depreciation Rate (%)
                          </label>
                          <input
                            type="number"
                            name="DepreciationRate"
                            value={addItem.DepreciationRate}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">
                            Depreciation Period Type
                          </label>
                          <select
                            name="DepreciationPeriodType"
                            value={addItem.DepreciationPeriodType}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="month">Month</option>
                            <option value="year">Year</option>
                          </select>
                        </div>
                      </div>

                      {/* Depreciation Period Value */}
                      <div>
                        <label className="block text-sm font-medium">
                          Depreciation Period Value
                        </label>
                        <input
                          type="number"
                          name="DepreciationPeriodValue"
                          value={addItem.DepreciationPeriodValue}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        />
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
      </div>
    </div>
  );
}
