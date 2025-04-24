import React, { useState, useEffect } from "react";
import { fetchData } from "../utilities/ApiUti";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Inventory_Modal from "./Components/Modal/Inventory_Modal";
import Inventory_Card from "./Components/Card/Inventory_Cards";
import "./Css/Electronics.css";
import { toast } from "react-toastify";

const API_URL = "https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/CategoryApi/";

export default function Inventory() {
  const [categories, setCategories] = useState([]);
  const [modalState, setModalState] = useState({
    isVisible: false,
    isEditMode: false,
    category: null,
  });
  const [newCategory, setNewCategory] = useState("");
  const navigate = useNavigate();

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
      toast.success(`Category added successfully!`);
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
      toast.success(`Category updated successfully!`);
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
        toast.error(`Category deleted successfully`);
      } catch (error) {
        console.error("Failed to delete category", error);
      }
    }
  };

  const handleEditClick = (category) => {
    setModalState({ isVisible: true, isEditMode: true, category });
    setNewCategory(category.categoryName);
  };

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-6">Stocks and Inventory</h1>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {/* Edit Button */}
          <button
            onClick={() =>
              setModalState({
                ...modalState,
                isEditMode: !modalState.isEditMode,
              })
            }
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            {modalState.isEditMode ? (
              <FaTimes className="mr-2" />
            ) : (
              <FaEdit className="mr-2" />
            )}
            {modalState.isEditMode ? "Cancel" : "Edit"}
          </button>

          {/* Add Category Button */}
          <button
            onClick={() =>
              setModalState({
                isVisible: true,
                isEditMode: false,
                category: null,
              })
            }
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
          onCategoryClick={handleCategoryClick}
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
