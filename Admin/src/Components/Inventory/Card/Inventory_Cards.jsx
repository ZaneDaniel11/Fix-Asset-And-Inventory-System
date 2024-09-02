import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const InventoryCards = ({
  categories,
  handleEditClick,
  handleDeleteCategory,
  isEditMode,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-10 gap-y-8">
      {categories.map((category) => (
        <div
          key={category.id}
          className="relative bg-BlackNgadiliBlack text-white rounded-3xl shadow-md hover:bg-gray-800 transition duration-300 p-4 flex flex-col justify-center items-center"
          style={{ width: "300px", height: "100px" }}
        >
          {isEditMode && (
            <div className="absolute top-2 left-2 flex gap-2">
              <button
                onClick={() => handleEditClick(category)}
                className="bg-blue-500 p-1 rounded-full text-white hover:bg-blue-700 flex items-center"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="bg-red-500 p-1 rounded-full text-white hover:bg-red-700 flex items-center"
              >
                <FaTrash />
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
