import React, { useState, useEffect } from "react";
import { fetchData } from "./utilities/ApiUti";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Inventory_Modal from "./Components/Inventory/Modal/Inventory_Modal";
import Inventory_Card from "./Components/Inventory/Card/Inventory_Cards";
import "./Css/Electronics.css";

const API_URL = "http://localhost:5075/api/CategoryApi/";

export default function Inventory() {
  const [categories, setCategories] = useState([]);
  const [modalState, setModalState] = useState({
    isVisible: false,
    isEditMode: false,
    category: null,
  });
  const [newCategory, setNewCategory] = useState("");
  const navigate = useNavigate(); // Use react-router-dom's useNavigate

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
      setModalState({ isVisible: false, isEditMode: false, category: null });
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
        `${API_URL}UpdateCategory?CategoryId=${modalState.category.id}`,
        "PUT",
        {
          id: modalState.category.id,
          categoryName: newCategory,
        }
      );
      setModalState({ isVisible: false, isEditMode: false, category: null });
      setNewCategory("");
      FetchCategory();
    } catch (error) {
      console.error("Failed to edit category", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await fetchData(
          `${API_URL}DeleteCategory?CategoryId=${categoryId}`,
          "DELETE"
        );
        FetchCategory();
      } catch (error) {
        console.error("Failed to delete category", error);
      }
    }
  };

  const handleEditClick = (category) => {
    setModalState({ isVisible: true, isEditMode: true, category });
    setNewCategory(category.categoryName);
  };

  // When a category is selected, navigate to Inventory_table with the selected category
  const handleCategoryClick = (category) => {
    navigate(`/InventoryTable`, {
      state: {
        selectedCategory: {
          id: category.id,
          categoryName: category.categoryName,
        },
      },
    });
  };

  useEffect(() => {
    FetchCategory();
  }, []);

  return (
    <div>
      <div className="text-center mb-8 w-full">
        <h1 className="text-3xl font-bold mb-8">Stocks and Inventory</h1>

        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() =>
              setModalState({
                ...modalState,
                isEditMode: !modalState.isEditMode,
              })
            }
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 flex items-center"
          >
            {modalState.isEditMode ? (
              <FaTimes className="mr-2" />
            ) : (
              <FaEdit className="mr-2" />
            )}
            {modalState.isEditMode ? "Cancel" : "Edit"}
          </button>

          <button
            onClick={() =>
              setModalState({
                isVisible: true,
                isEditMode: false,
                category: null,
              })
            }
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-300 flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Category
          </button>
        </div>

        <Inventory_Card
          categories={categories}
          handleEditClick={handleEditClick}
          handleDeleteCategory={handleDeleteCategory}
          isEditMode={modalState.isEditMode}
          onCategoryClick={handleCategoryClick} // Pass the click handler to Inventory_Card
        />
      </div>

      {modalState.isVisible && (
        <Inventory_Modal
          isEditMode={modalState.isEditMode}
          category={modalState.category}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          handleAddCategory={handleAddCategory}
          handleEditCategory={handleEditCategory}
          closeModal={() =>
            setModalState({
              isVisible: false,
              isEditMode: false,
              category: null,
            })
          }
        />
      )}
    </div>
  );
}
