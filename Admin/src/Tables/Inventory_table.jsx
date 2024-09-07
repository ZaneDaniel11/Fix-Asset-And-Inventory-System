import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../Css/Electronics.css";
import { fetchData } from "../utilities/ApiUti";

export default function Inventory_table() {
  const location = useLocation();
  const selectedCategory = location.state?.selectedCategory;
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modals, setModals] = useState({
    add: false,
  });

  const [addItem, setAddCategoryItem] = useState({
    ItemName: "",
    Quantity: "",
    Description: "",
  });

  // Toggle modals
  const toggleModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const fetchItems = async () => {
    try {
      if (selectedCategory && selectedCategory.id) {
        const result = await fetchData(
          `http://localhost:5075/api/ItemApi/GetItemsByCategory?categoryID=${selectedCategory.id}`,
          "GET"
        );
        setItems(result); // Set all items
        setFilteredItems(result); // Initially, filteredItems will be the same as all items
        setLoading(false); // Set loading to false after fetching
        console.log(result);
      } else {
        console.error("No selectedCategory or ID provided");
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch items", error);
      setLoading(false); // Ensure loading is false even on error
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      console.log("Category ID:", selectedCategory.id);
      console.log("Category Name:", selectedCategory.categoryName);
      fetchItems(); // Fetch items when selectedCategory changes
    } else {
      console.error("No category selected.");
      setLoading(false);
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
    setAddUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategoryItem = async (e) => {
    e.preventDefault();

    // Replace with actual API call to add a user
    console.log("Add user details:", addUser);

    // Close modal after adding user
    toggleModal("add");

    // Reset the form
    setAddUser({
      userName: "",
      password: "",
      email: "",
      userType: "",
    });

    // Fetch updated items (or users)
    fetchItems();
  };

  return (
    <div>
      <div>
        <h1>Inventory Table</h1>
        {selectedCategory ? (
          <p>Selected Category: {selectedCategory.categoryName}</p>
        ) : (
          <p>No category selected</p>
        )}
      </div>

      <div className="limiter">
        <div className="container-table100">
          <div className="wrap-table100">
            <div className="table100">
              <div className="flex space justify-between">
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
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
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

      {/* Add User Modal */}
      {modals.add && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Add Category</h5>
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
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => toggleModal("add")}
                  className="text-gray-600 hover:text-gray-800 me-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
