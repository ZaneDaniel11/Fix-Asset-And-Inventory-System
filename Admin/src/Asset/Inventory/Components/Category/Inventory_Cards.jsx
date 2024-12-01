import React from "react";
import { FaPen, FaTrash } from "react-icons/fa";

const InventoryCards = ({
  categories,
  handleEditClick,
  handleDeleteCategory,
  isEditMode,
  onCategoryClick, // Ensure you're passing this prop from the parent component
}) => {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 px-4"
      style={{ gap: "70px" }} // Fallback inline styles for gaps
    >
      {categories.map((category) => (
        <div
          key={category.categoryId}
          className="relative bg-gray-900 text-white rounded-3xl shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all duration-300 p-6 flex flex-col justify-center items-center cursor-pointer"
          style={{ width: "300px", height: "130px" }} // Adjusted size for consistency
          onClick={() => onCategoryClick(category)} // Add the onClick event here
        >
          {/* Edit/Delete Buttons */}
          {isEditMode && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering category click
                  handleEditClick(category);
                }}
                className="p-2 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-md transition duration-200"
                aria-label="Edit Category"
              >
                <FaPen />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering category click
                  handleDeleteCategory(category.categoryId);
                }}
                className="p-2 bg-red-700 hover:bg-red-800 text-white rounded-full shadow-md transition duration-200"
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
