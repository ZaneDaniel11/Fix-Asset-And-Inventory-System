import React from "react";

const InventoryCards = ({
  categories,
  handleEditClick,
  handleDeleteCategory,
  isEditMode,
  onCategoryClick, // Ensure you're passing this prop from the parent component
}) => {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
      style={{ gap: "24px" }} // Fallback inline styles for gaps
    >
      {categories.map((category) => (
        <div
          key={category.categoryId}
          className="relative bg-BlackNgadiliBlack text-white rounded-3xl shadow-md hover:bg-gray-800 transition duration-300 p-4 flex flex-col justify-center items-center"
          style={{ width: "300px", height: "100px" }}
          onClick={() => onCategoryClick(category)} // Add the onClick event here
        >
          {isEditMode && (
            <div className="absolute top-2 left-2 flex gap-2">
              <button
                onClick={() => handleEditClick(category)}
                className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
              >
                <i className="fa-solid fa-pen"></i>
              </button>
              <button
                onClick={() => handleDeleteCategory(category.categoryId)}
                className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          )}
          <span className="text-center">{category.categoryName}</span>
        </div>
      ))}
    </div>
  );
};

export default InventoryCards;
