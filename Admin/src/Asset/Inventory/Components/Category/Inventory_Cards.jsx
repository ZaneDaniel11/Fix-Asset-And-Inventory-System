"use client"
import { FaPen, FaTrash } from "react-icons/fa"

const InventoryCards = ({ categories, handleEditClick, handleDeleteCategory, isEditMode, onCategoryClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <div
          key={category.categoryId}
          className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          onClick={() => onCategoryClick(category)}
        >
          {/* Card Content */}
          <div className="p-6 flex flex-col h-32 justify-between">
            {/* Category Name */}
            <h3 className="text-xl font-bold tracking-tight">{category.categoryName}</h3>

            {/* Item count if available */}
            {category.itemCount !== undefined && (
              <div className="text-sm text-gray-300">{category.itemCount} items</div>
            )}
          </div>

          {/* Edit/Delete Buttons */}
          {isEditMode && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditClick(category)
                }}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition duration-200"
                aria-label="Edit Category"
              >
                <FaPen size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteCategory(category.categoryId)
                }}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-full transition duration-200"
                aria-label="Delete Category"
              >
                <FaTrash size={12} />
              </button>
            </div>
          )}

          {/* Bottom accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
        </div>
      ))}

      {/* Add New Category Card */}
      {isEditMode && (
        <div
          className="bg-gradient-to-br from-gray-800 to-gray-700 text-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col items-center justify-center h-32 p-6"
          onClick={() => handleEditClick({ categoryId: 0, categoryName: "" })}
        >
          <div className="mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">Add New Category</h3>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 h-1 w-full bg-gradient-to-r from-gray-600 to-gray-500"></div>
        </div>
      )}
    </div>
  )
}

export default InventoryCards

