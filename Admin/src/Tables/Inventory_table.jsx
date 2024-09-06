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

  // Fetch all items based on the selected category
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

  // Update filtered items whenever items or selectedCategory change
  useEffect(() => {
    if (selectedCategory && items.length > 0) {
      const filtered = items.filter(
        (item) => item.categoryID === selectedCategory.id
      );
      setFilteredItems(filtered);
    }
  }, [items, selectedCategory]);

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
              <h2 className="text-2xl mb-4">
                Items in {selectedCategory?.categoryName || "All Categories"}
              </h2>
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
    </div>
  );
}
