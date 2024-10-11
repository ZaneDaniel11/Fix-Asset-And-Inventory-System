import React from "react";

const Inventory_Modal = ({
  isEditMode,
  category,
  newCategory,
  setNewCategory,
  handleAddCategory,
  handleEditCategory,
  closeModal,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? "Edit Category" : "Add New Category"}
        </h2>
        <form onSubmit={isEditMode ? handleEditCategory : handleAddCategory}>
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
              onClick={closeModal}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700 transition duration-300 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className=" bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded transition duration-300"
            >
              {isEditMode ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Inventory_Modal;
