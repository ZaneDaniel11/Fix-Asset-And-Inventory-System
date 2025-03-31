import React from "react";
import { FaTimes } from "react-icons/fa";

const InventoryModal = ({
  isEditMode,
  category,
  newCategory,
  setNewCategory,
  categoryViewID,
  setCategoryViewID,
  handleAddCategory,
  handleEditCategory,
  closeModal,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white text-gray-700 rounded-lg shadow-lg w-11/12 max-w-lg p-6 relative">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-400 hover:text-black transition"
          aria-label="Close Modal"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isEditMode ? "Edit Category" : "Add New Category"}
        </h2>

        <form onSubmit={isEditMode ? handleEditCategory : handleAddCategory}>
          {/* Category Name */}
          <div className="mb-4">
            <label
              htmlFor="categoryName"
              className="block font-medium text-gray-700"
            >
              Category Name
            </label>
            <input
              type="text"
              id="categoryName"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter category name"
            />
          </div>

          {/* Category View Dropdown */}
          <div className="mb-6">
            <label
              htmlFor="categoryView"
              className="block font-medium text-gray-700"
            >
              Category Type
            </label>
            <select
              id="categoryView"
              value={categoryViewID}
              onChange={(e) => setCategoryViewID(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Department</option>
              <option value={1}>Faculty</option>
            </select>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition duration-300"
            >
              {isEditMode ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;
