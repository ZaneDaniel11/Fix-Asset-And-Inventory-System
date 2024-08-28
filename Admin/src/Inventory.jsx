import React, { useState, useEffect } from "react";
import { fetchData } from "./utilities/ApiUti";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";

const API_URL = "http://localhost:5075/api/CategoryApi/";

export default function Inventory() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  // Table Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModal, setAddModalOpen] = useState(false);
  const [viewModal, setViewModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([
    {
      id: 2,
      name: "Chairs",
      quantity: 69,
      price: 400,
      dateAdded: "2017-09-26 05:57",
    },
  ]);
  // Table
  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => setAddModalOpen(false);

  const openViewModal = (item) => {
    setCurrentItem(item);
    setViewModalOpen(true);
  };
  const closeViewModal = () => setViewModalOpen(false);

  const openDeleteModal = () => setDeleteModalOpen(true);
  const closeDeleteModal = () => setDeleteModalOpen(false);
  // Table end
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

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="text-center mb-8 w-full">
        <h1 className="text-3xl font-bold mb-8">Stocks and Inventory</h1>

        <div className="flex items-center">
          <button
            onClick={() => setShowModal(true)}
            className={`mb-8 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-300 flex items-center ${
              isEditMode ? "hidden" : ""
            }`}
          >
            <FaPlus className="mr-2" />
            Add Category
          </button>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 ">
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

      <div>
        <div className="limiter">
          <div className="container-table100">
            <div className="wrap-table100">
              <div className="table100">
                <div className="mb-4 flex justify-between">
                  <input
                    type="text"
                    placeholder="Search by Item Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 border rounded border-black"
                  />
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
                  >
                    Add Item
                  </button>
                </div>
                <table>
                  <thead>
                    <tr className="table100-head">
                      <th className="column1">Item ID</th>
                      <th className="column2">Item Name</th>
                      <th className="column3">Quantity</th>
                      <th className="column4">Unit Price</th>
                      <th className="column5">Date Added</th>
                      <th className="column6">Operation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id}>
                        <td className="column1">{item.id}</td>
                        <td className="column2">{item.name}</td>
                        <td className="column3">{item.quantity}</td>
                        <td className="column4">{item.price}</td>
                        <td className="column5">{item.dateAdded}</td>
                        <td className="column6 flex justify-center mt-2 items-center ">
                          <div className="flex justify-center  items-center pl-20">
                            <button
                              type="button"
                              onClick={() => openViewModal(item)}
                              className="text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                            >
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            <button
                              type="button"
                              onClick={openAddModal}
                              className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              onClick={openDeleteModal}
                              type="button"
                              className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Add Item</h5>
              <button
                type="button"
                onClick={closeAddModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form action="">
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="text"
                    placeholder="Item Name"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="text"
                    placeholder="Quantity"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline border border-black"
                    type="text"
                    placeholder="Unit Price"
                  />
                </div>
                <div className="my-4">
                  <textarea
                    placeholder="Description"
                    className="h-32 bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline w-full border border-black"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModal && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">View Item</h5>
              <button
                type="button"
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="mt-4">
              <p>
                <strong>Item Name:</strong> {currentItem.name}
              </p>
              <p>
                <strong>Quantity:</strong> {currentItem.quantity}
              </p>
              <p>
                <strong>Unit Price:</strong> {currentItem.price}
              </p>
              <p>
                <strong>Date Added:</strong> {currentItem.dateAdded}
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={closeViewModal}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <h5 className="text-lg font-semibold">
              Are you sure you want to delete?
            </h5>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
