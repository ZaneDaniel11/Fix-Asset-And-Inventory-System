import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5075/api/UserItemApi/";

const ProductList = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0); // Use ID for category filtering

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
        icon: "📦", // default icon for all categories
        count: category.itemCount,
      }));

      setCategories([
        { id: 0, name: "All", icon: "📦", count: 0 }, // "All" category
        ...mappedCategories,
      ]);
    } catch (error) {
      console.error("Failed to fetch categories or counts", error);
    }
  };

  // Fetch products based on the selected category ID
  const FetchProductsByCategory = async (categoryId) => {
    try {
      let response;
      if (categoryId === 0) {
        // Fetch all products if "All" is selected
        response = await fetch(`${API_URL}GetAllItems`);
      } else {
        // Fetch products by category ID
        response = await fetch(
          `http://localhost:5075/api/ItemApi/GetItemsByCategory?categoryID=${categoryId}`
        );
      }

      const result = await response.json();
      setProducts(result);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  // Fetch categories when the component mounts
  useEffect(() => {
    FetchCategoryWithCounts();
    FetchProductsByCategory(0); // Fetch all products initially
  }, []);

  // Fetch products every time the selected category changes
  useEffect(() => {
    FetchProductsByCategory(selectedCategoryId);
  }, [selectedCategoryId]);

  return (
    <div className="w-full">
      {/* Scrollable Category List UI */}
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
              onClick={() => setSelectedCategoryId(category.id)} // Set selectedCategoryId to category.id
            >
              {/* Category Icon */}
              <div className="text-3xl mb-2">{category.icon}</div>
              {/* Category Name */}
              <div className="font-semibold">{category.name}</div>
              {/* Item Count */}
              <div className="text-gray-500 text-sm">
                {category.count} items
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.itemID} className="border p-4 rounded-lg shadow-lg">
            <img
              src="https://via.placeholder.com/100"
              alt={product.itemName}
              className="mb-4"
            />
            <h3 className="text-lg font-bold">{product.itemName}</h3>
            <p>{`Quantity:${product.quantity}`}</p>
            <button className="mt-3 w-full bg-green-500 text-white py-2 rounded">
              Add to Dish
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
