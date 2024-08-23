import React, { useState, useEffect } from "react";
import { fetchData } from "./utilities/ApiUti";

const API_URL = "http://localhost:5075/api/CategoryApi/";

export default function Inventory() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showModal, setShowModal] = useState(false);

  const FetchCategory = async () => {
    try {
      const result = await fetchData(`${API_URL}GetCategory`, "GET");
      setCategories(result);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await fetchData(`${API_URL}InsertCategory`, "POST", {
        id: 0,
        categoryName: newCategory,
      });
      setShowModal(false); // Close the modal
      FetchCategory(); // Refresh category list after adding
    } catch (error) {
      console.error("Failed to add category", error);
    }
  };

  useEffect(() => {
    FetchCategory();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100 mx-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-8">Stocks and Inventory</h1>
        <button
          onClick={() => setShowModal(true)}
          className="mb-8 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
        >
          Add Category
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20">
          {categories.map((category) => (
            <button
              key={category.Id}
              className="bg-BlackNgadiliBlack text-white py-8 px-16 rounded-3xl shadow-md hover:bg-gray-800 transition duration-300 text-3xl"
              onClick={() => handleCategoryClick(category.categoryName)}
            >
              {category.categoryName}
            </button>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700 transition duration-300 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
