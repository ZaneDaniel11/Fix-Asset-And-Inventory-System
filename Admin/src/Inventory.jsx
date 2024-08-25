import React, { useState, useEffect } from "react";
import { fetchData } from "./utilities/ApiUti";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa"; // Importing icons from react-icons

const API_URL = "http://localhost:5075/api/CategoryApi/";

export default function Inventory() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

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
      setShowModal(false);
      setNewCategory("");
      FetchCategory();
    } catch (error) {
      console.error("Failed to add category", error);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      await fetchData(
        `${API_URL}UpdateCategory?CategoryId=${editCategory.id}`,
        "PUT",
        {
          id: editCategory.id,
          categoryName: newCategory,
        }
      );
      setShowModal(false);
      setEditCategory(null);
      setIsEditMode(false);
      setNewCategory("");
      FetchCategory();
    } catch (error) {
      console.error("Failed to edit category", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await fetchData(
        `${API_URL}DeleteCategory?CategoryId=${categoryId}`,
        "DELETE"
      );
      FetchCategory();
    } catch (error) {
      console.error("Failed to delete category", error);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleEditClick = (category) => {
    setEditCategory(category);
    setNewCategory(category.categoryName);
    setShowModal(true);
  };

  useEffect(() => {
    FetchCategory();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100 mx-20">
      <div className="text-center mb-8 w-full">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleEditMode}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 flex items-center"
          >
            {isEditMode ? (
              <FaTimes className="mr-2" />
            ) : (
              <FaEdit className="mr-2" />
            )}
            {isEditMode ? "Cancel" : "Edit"}
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-8">Stocks and Inventory</h1>
        <button
          onClick={() => setShowModal(true)}
          className={`mb-8 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-300 flex items-center ${
            isEditMode ? "hidden" : ""
          }`}
        >
          <FaPlus className="mr-2" />
          Add Category
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative transition-transform duration-300 ease-in-out"
            >
              <button
                className="bg-BlackNgadiliBlack text-white py-8 px-16 rounded-3xl shadow-md hover:bg-gray-800 transition duration-300 text-3xl"
                onClick={() =>
                  isEditMode
                    ? handleEditClick(category)
                    : console.log(`Selected: ${category.categoryName}`)
                }
              >
                {category.categoryName}
              </button>
              {isEditMode && (
                <>
                  <button
                    onClick={() => handleEditClick(category)}
                    className="absolute top-0 right-0 mt-2 mr-2 bg-yellow-500 p-2 rounded-full text-white hover:bg-yellow-700 flex items-center"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="absolute top-0 left-0 mt-2 ml-2 bg-red-500 p-2 rounded-full text-white hover:bg-red-700 flex items-center"
                  >
                    <FaTrash />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">
              {editCategory ? "Edit Category" : "Add New Category"}
            </h2>
            <form
              onSubmit={editCategory ? handleEditCategory : handleAddCategory}
            >
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
                  onClick={() => {
                    setShowModal(false);
                    setEditCategory(null);
                  }}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700 transition duration-300 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                >
                  {editCategory ? "Save Changes" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
