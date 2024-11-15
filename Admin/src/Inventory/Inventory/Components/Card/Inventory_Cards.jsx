import React from "react";
import { FaPen, FaTrash } from "react-icons/fa";

const InventoryCards = ({
  categories,
  handleEditClick,
  handleDeleteCategory,
  isEditMode,
  onCategoryClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="relative bg-gray-900 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer flex flex-col items-center justify-center"
          style={{ height: "130px" }} // Adjusted height for larger cards
          onClick={() => onCategoryClick(category)}
        >
          {/* Edit/Delete Buttons */}
          {isEditMode && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering category click
                  handleEditClick(category);
                }}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md transition duration-200"
                aria-label="Edit Category"
              >
                <FaPen />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering category click
                  handleDeleteCategory(category.id);
                }}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition duration-200"
                aria-label="Delete Category"
              >
                <FaTrash />
              </button>
            </div>
          )}

          {/* Category Name */}
          <h3 className="text-xl font-semibold text-center">
            {category.categoryName}
          </h3>
        </div>
      ))}
    </div>
  );
};

export default InventoryCards;
