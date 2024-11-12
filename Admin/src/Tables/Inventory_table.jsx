import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../Css/Electronics.css";
import { fetchData } from "../utilities/ApiUti";

const API_URL = "http://localhost:5075/api/ItemApi/";

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
    } catch (error) {
      console.error("Failed to add item", error);
    }
  };

  const handleUpdateItem = async () => {
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
      toggleModal("addQuantity");
      fetchItems();
    } catch (error) {
      console.error("Failed to add quantity", error);
    }
  };

  return (
    <div>
      <div className="limiter">
        <div className="container-table100">
          <div className="wrap-table100">
            <div className="table100">
              <div className="flex space justify-between mb-4">
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
                <table>
                  <thead>
                    <tr className="table100-head">
                      <th className="column1">Item ID</th>
                      <th className="column2">Item Name</th>
                      <th className="column3">Quantity</th>
                      <th className="column4">Unit Price</th>
                      <th className="column5">Date Added</th>
                      <th className="column6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <tr key={item.itemID}>
                          <td className="column1">{item.itemID}</td>
                          <td className="column2">{item.itemName}</td>
                          <td className="column3">{item.quantity}</td>
                          <td className="column4">{item.unitPrice}</td>
                          <td className="column5">
                            {new Date(item.dateAdded).toLocaleDateString()}
                          </td>
                          <td className="column6  w-32 flex">
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
                              className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                toggleModal("delete");
                              }}
                              className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                toggleModal("addQuantity"); // Open the add quantity modal
                              }}
                              className="text-white bg-orange-500 hover:bg-orange-600 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
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
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
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
      </div>

      {modals.addQuantity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
            <h2 className="text-xl font-semibold mb-4">
              Add Quantity to {selectedItem?.itemName}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={addQuantity}
                onChange={(e) => setAddQuantity(parseInt(e.target.value))}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => toggleModal("addQuantity")}
                className="text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium rounded-lg text-sm px-4 py-2 me-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuantity}
                className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
              >
                Add Quantity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {modals.add && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Add Item</h5>
              <button
                type="button"
                onClick={() => toggleModal("add")}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleAddCategoryItem}>
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
                  <div className="relative">
                    <input
                      type="text"
                      name="ItemName"
                      value={addItem.ItemName}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                      placeholder="Item Name"
                      required
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      name="Quantity"
                      value={addItem.Quantity}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                      placeholder="Quantity"
                      required
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="Description"
                      value={addItem.Description}
                      onChange={handleInputChange}
                      className="p-2 border rounded border-black w-full"
                      placeholder="Description"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  onClick={() => toggleModal("add")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className=" bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                >
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
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Update Item</h5>
              <button
                type="button"
                onClick={() => toggleModal("update")}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="mt-4">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
                <div className="relative">
                  <input
                    type="text"
                    name="itemName"
                    value={updatedItem.itemName}
                    onChange={handleUpdateInputChange}
                    className="p-2 border rounded border-black w-full"
                    placeholder="Item Name"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    name="quantity"
                    value={updatedItem.quantity}
                    onChange={handleUpdateInputChange}
                    className="p-2 border rounded border-black w-full"
                    placeholder="Quantity"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="description"
                    value={updatedItem.description}
                    onChange={handleUpdateInputChange}
                    className="p-2 border rounded border-black w-full"
                    placeholder="Description"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                onClick={() => toggleModal("update")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleUpdateItem}
              >
                Update Item
              </button>
            </div>
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
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">View Item</h5>
              <button
                type="button"
                onClick={() => toggleModal("view")}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="mt-4">
              <p>Item ID: {selectedItem?.itemID}</p>
              <p>Item Name: {selectedItem?.itemName}</p>
              <p>Quantity: {selectedItem?.quantity}</p>
              <p>Description: {selectedItem?.description}</p>
              <p>
                Date Added:{" "}
                {new Date(selectedItem?.dateAdded).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
