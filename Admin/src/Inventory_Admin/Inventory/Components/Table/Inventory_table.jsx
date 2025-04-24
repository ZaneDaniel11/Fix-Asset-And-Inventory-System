import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../Css/Electronics.css";
import "../../Css/modal.css";
import { fetchData } from "../../../utilities/ApiUti";
import { toast } from "react-toastify";

const API_URL = "https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/ItemApi/";

export default function Inventory_table() {
  const location = useLocation();
  const selectedCategory = location.state?.selectedCategory;
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modals, setModals] = useState({
    add: false,
    update: false,
    delete: false,
    view: false,
    addQuantity: false, // New modal for adding quantity
  });
  const [selectedItem, setSelectedItem] = useState(null);

  const [addItem, setAddCategoryItem] = useState({
    ItemName: "",
    Quantity: "",
    Description: "",
  });

  const [updatedItem, setUpdatedItem] = useState({
    itemName: "",
    quantity: "",
    description: "",
  });

  useEffect(() => {
    console.log("Selected Category:", selectedCategory);
    if (selectedCategory) {
      fetchItems();
    }
  }, [selectedCategory]);

  const [addQuantity, setAddQuantity] = useState(0); // New state for additional quantity

  // Toggle modals
  const toggleModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const fetchItems = async () => {
    try {
      if (selectedCategory?.id) {
        const result = await fetchData(
          `${API_URL}GetItemsByCategory?categoryID=${selectedCategory.id}`,
          "GET"
        );
        setItems(result);
        setFilteredItems(result);
        setLoading(false);
        console.log(result);
      } else {
        console.error("No valid category ID provided.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch items", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchItems();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory && items.length > 0) {
      const filtered = items.filter(
        (item) => item.categoryID === selectedCategory.id
      );
      setFilteredItems(filtered);
    }
  }, [items, selectedCategory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddCategoryItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategoryItem = async (e) => {
    e.preventDefault();
    try {
      await fetchData(`${API_URL}InsertItem`, "POST", {
        itemID: 0,
        categoryID: selectedCategory.id,
        itemName: addItem.ItemName,
        quantity: addItem.Quantity,
        description: addItem.Description,
        dateAdded: new Date().toISOString(),
      });
      toggleModal("add");
      fetchItems();
      toast.success(`Added Item on Category successfully!`);
    } catch (error) {
      console.error("Failed to add item", error);
    }
  };

  const handleUpdateItems = async () => {
    try {
      await fetchData(
        `${API_URL}UpdateItem?ItemID=${selectedItem.itemID}&CategoryID=${selectedCategory.id}`,
        "PUT",
        {
          itemID: selectedItem.itemID,
          categoryID: selectedCategory.id,
          itemName: updatedItem.itemName,
          quantity: updatedItem.quantity,
          description: updatedItem.description,
          dateAdded: selectedItem.dateAdded,
        }
      );
      toggleModal("update");
      fetchItems();
      toast.success(`Item Updated Succesfully`);
    } catch (error) {
      console.error("Failed to update item", error);
    }
  };

  const handleDeleteItem = async () => {
    try {
      await fetchData(
        `${API_URL}DeleteItem?ItemID=${selectedItem.itemID}&CategoryID=${selectedCategory.id}`,
        "DELETE"
      );
      toggleModal("delete");
      fetchItems();
      toast.error(`Delete Item on Category Succesfully`);
    } catch (error) {
      console.error("Failed to delete item", error);
    }
  };

  const handleAddQuantity = async () => {
    try {
      const newQuantity = selectedItem.quantity + addQuantity;
      await fetchData(
        `${API_URL}UpdateItem?ItemID=${selectedItem.itemID}&CategoryID=${selectedCategory.id}`,
        "PUT",
        {
          itemID: selectedItem.itemID,
          categoryID: selectedCategory.id,
          itemName: selectedItem.itemName,
          quantity: newQuantity,
          description: selectedItem.description,
          dateAdded: selectedItem.dateAdded,
        }
      );
      toast.success(`Added Quantity successfully!`);
      toggleModal("addQuantity");
      fetchItems();
    } catch (error) {
      console.error("Failed to add quantity", error);
    }
  };

  return (
    <div>
      <div className="limiter w-full">
        <div className="container mx-auto p-6">
          <div className="bg-gray-200 p-6 shadow-lg rounded-lg mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-700">
              Items in {selectedCategory?.categoryName || "All Categories"}
            </h2>
          </div>
          {/* Action Section */}
          <div className="bg-white p-6 shadow-md rounded-lg mb-8 flex justify-between items-center">
            <button
              onClick={() => toggleModal("add")}
              className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
            >
              <i className="fa-solid fa-plus"></i> Add Item
            </button>
          </div>
          <div className="overflow-x-auto shadow-md rounded-lg">
            {loading ? (
              <p className="text-center p-4">Loading...</p>
            ) : (
              <table className="min-w-full border-collapse border border-gray-200 bg-white">
                <thead className="bg-gray-200">
                  <tr className="font-semibold text-md text-zinc-50">
                    <th className="border border-gray-300 px-5 py-3">
                      Item ID
                    </th>
                    <th className="border border-gray-300 px-5 py-3">
                      Item Name
                    </th>
                    <th className="border border-gray-300 px-5 py-3">
                      Quantity
                    </th>
                    <th className="border border-gray-300 px-5 py-3">
                      Date Added
                    </th>
                    <th className="border border-gray-300 px-5 py-3 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => (
                      <tr
                        key={item.itemID}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100 transition duration-200`}
                      >
                        <td className="border border-gray-300 px-5 py-3">
                          {item.itemID}
                        </td>
                        <td className="border border-gray-300 px-5 py-3">
                          {item.itemName}
                        </td>
                        <td className="border border-gray-300 px-5 py-3">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-300 px-5 py-3">
                          {new Date(item.dateAdded).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-300 px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setUpdatedItem({
                                  itemName: item.itemName,
                                  quantity: item.quantity,
                                  description: item.description,
                                });
                                toggleModal("update");
                              }}
                              className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                toggleModal("delete");
                              }}
                              className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-3 py-1.5"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                toggleModal("addQuantity");
                              }}
                              className="text-white bg-orange-500 hover:bg-orange-600 font-medium rounded-lg text-sm px-3 py-1.5"
                            >
                              <i className="fa-solid fa-plus"></i>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                toggleModal("view");
                              }}
                              className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                            >
                              <i className="fa-solid fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-4 text-gray-500">
                        No items in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {modals.addQuantity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full mx-4 md:mx-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Add Quantity to {selectedItem?.itemName}
              </h2>
              <button
                onClick={() => toggleModal("addQuantity")}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close Modal"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Input */}
            <div className="mb-6">
              <label
                htmlFor="add-quantity"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Quantity
              </label>
              <input
                type="number"
                id="add-quantity"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={addQuantity}
                onChange={(e) => setAddQuantity(parseInt(e.target.value))}
                placeholder="Enter Quantity"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => toggleModal("addQuantity")}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleAddQuantity} className="btn-primary">
                Add Quantity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {modals.add && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full mx-4 md:mx-0">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Add Item</h2>
              <button
                onClick={() => toggleModal("add")}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close Modal"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Form Section */}
            <form onSubmit={handleAddCategoryItem}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Item Name Input */}
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-box fa-lg text-blue-500"></i>
                  <div className="flex-1">
                    <label
                      htmlFor="item-name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Item Name
                    </label>
                    <input
                      type="text"
                      id="item-name"
                      name="ItemName"
                      value={addItem.ItemName}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter Item Name"
                      required
                    />
                  </div>
                </div>

                {/* Quantity Input */}
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-hashtag fa-lg text-green-500"></i>
                  <div className="flex-1">
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="Quantity"
                      value={addItem.Quantity}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter Quantity"
                      required
                    />
                  </div>
                </div>

                {/* Description Input */}
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-align-left fa-lg text-yellow-500"></i>
                  <div className="flex-1">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="Description"
                      value={addItem.Description}
                      onChange={handleInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Enter Description"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => toggleModal("add")}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Item Modal */}
      {modals.update && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full mx-4 md:mx-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Update Item
              </h2>
              <button
                onClick={() => toggleModal("update")}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close Modal"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateItems}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Item Name */}
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-box fa-lg text-blue-500"></i>
                  <div className="flex-1">
                    <label
                      htmlFor="update-item-name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Item Name
                    </label>
                    <input
                      type="text"
                      id="update-item-name"
                      name="itemName"
                      value={updatedItem.itemName}
                      onChange={handleUpdateInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter Item Name"
                      required
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-hashtag fa-lg text-green-500"></i>
                  <div className="flex-1">
                    <label
                      htmlFor="update-quantity"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="update-quantity"
                      name="quantity"
                      value={updatedItem.quantity}
                      onChange={handleUpdateInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter Quantity"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-align-left fa-lg text-yellow-500"></i>
                  <div className="flex-1">
                    <label
                      htmlFor="update-description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      id="update-description"
                      name="description"
                      value={updatedItem.description}
                      onChange={handleUpdateInputChange}
                      className="input-field border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Enter Description"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => toggleModal("update")}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modals.delete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Delete Item</h5>
              <button
                type="button"
                onClick={() => toggleModal("delete")}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="mt-4">
              <p>Are you sure you want to delete this item?</p>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  onClick={() => toggleModal("delete")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={handleDeleteItem}
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {modals.view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full mx-4 md:mx-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">View Item</h2>
              <button
                onClick={() => toggleModal("view")}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close Modal"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Content */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-id-badge fa-lg text-blue-500"></i>
                <span className="text-lg font-semibold text-gray-800">
                  <strong>Item ID:</strong> {selectedItem?.itemID}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-box fa-lg text-green-500"></i>
                <span className="text-lg font-semibold text-gray-800">
                  <strong>Item Name:</strong> {selectedItem?.itemName}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-hashtag fa-lg text-yellow-500"></i>
                <span className="text-lg font-semibold text-gray-800">
                  <strong>Quantity:</strong> {selectedItem?.quantity}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-align-left fa-lg text-purple-500"></i>
                <span className="text-lg font-semibold text-gray-800">
                  <strong>Description:</strong> {selectedItem?.description}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-calendar-day fa-lg text-red-500"></i>
                <span className="text-lg font-semibold text-gray-800">
                  <strong>Date Added:</strong>{" "}
                  {new Date(selectedItem?.dateAdded).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
