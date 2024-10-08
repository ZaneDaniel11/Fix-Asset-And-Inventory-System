import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5075/api/UserItemApi/";

const ProductList = ({ products, onAddProduct, setProducts }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);

  // Fetch categories with their item counts from the API
  const FetchCategoryWithCounts = async () => {
    try {
      const response = await fetch(`${API_URL}GetItemCountsByCategory`, {
        method: "GET",
      });
      const result = await response.json();

      const mappedCategories = result.map((category) => ({
        id: category.categoryID,
        name: category.categoryName,
        icon: "📦",
        count: category.itemCount,
      }));

      // Add "All" category at the beginning
      setCategories([
        { id: 0, name: "All", icon: "📦", count: 0 }, // 'All' category
        ...mappedCategories,
      ]);
    } catch (error) {
      console.error("Failed to fetch categories or counts", error);
    }
  };

  // Fetch products by category
  const FetchProductsByCategory = async (categoryId) => {
    try {
      let response;
      if (categoryId === 0) {
        // Fetch all items if "All" is selected
        response = await fetch(`${API_URL}GetAllItems`);
      } else {
        // Fetch items by category
        response = await fetch(
          `http://localhost:5075/api/ItemApi/GetItemsByCategory?categoryID=${categoryId}`
        );
      }

      const result = await response.json();

      // Save both the initial quantity and available quantity for later manipulation
      const processedProducts = result.map((product) => ({
        ...product,
        initialQuantity: product.quantity, // This saves the initial stock for reference
      }));

      setProducts(processedProducts);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  useEffect(() => {
    FetchCategoryWithCounts();
    FetchProductsByCategory(0);
  }, []);

  useEffect(() => {
    FetchProductsByCategory(selectedCategoryId);
  }, [selectedCategoryId]);

  return (
    <div className="w-full">
      <div className="overflow-x-auto mb-6">
        <div
          className="flex gap-4 w-full"
          style={{ maxWidth: "100%", overflowX: "auto" }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              className={`flex flex-col items-center p-4 w-28 min-w-max rounded-lg border shadow-md ${
                selectedCategoryId === category.id
                  ? "bg-green-100 border-green-400"
                  : "bg-white border-gray-200"
              } hover:bg-green-50`}
              onClick={() => setSelectedCategoryId(category.id)} // When "All" is clicked, fetch all items
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="font-semibold">{category.name}</div>
              <div className="text-gray-500 text-sm">
                {category.count} items
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.itemID} className="border p-4 rounded-lg shadow-lg">
            <img
              src="https://via.placeholder.com/100"
              alt={product.itemName}
              className="mb-4"
            />
            <h3 className="text-lg font-bold">{product.itemName}</h3>
            <p>{`Available Quantity: ${product.quantity}`}</p>

            {product.quantity === 0 ? (
              <p className="text-red-500 font-bold">Out of Stock</p>
            ) : (
              <button
                className="mt-3 w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded"
                onClick={() => onAddProduct(product)}
                disabled={product.quantity <= 0}
              >
                Add Product
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
