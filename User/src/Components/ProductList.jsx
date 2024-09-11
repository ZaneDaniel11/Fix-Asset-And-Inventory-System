import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5075/api/UserItemApi/";

// Sample products (these are static for now, ideally fetched from an API)
const products = [
  {
    id: 1,
    name: "Tasty Vegetable Salad",
    price: "$11.99",
    category: "Main Course",
  },
  {
    id: 2,
    name: "Original Cheese Burger",
    price: "$12.99",
    category: "Burgers",
  },
  {
    id: 3,
    name: "Taco Salad With Chicken",
    price: "$9.99",
    category: "Main Course",
  },
  // Add more products here...
];

const ProductList = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch categories with their item counts from the API
  const FetchCategoryWithCounts = async () => {
    try {
      // Fetch categories and their item counts from GetItemCountsByCategory API
      const response = await fetch(`${API_URL}GetItemCountsByCategory`, {
        method: "GET",
      });
      const result = await response.json();

      // Map API data to include icons
      const mappedCategories = result.map((category) => ({
        id: category.categoryID,
        name: category.categoryName,
        icon: "📦", // default icon for all categories
        count: category.itemCount, // the actual item count from the API
      }));

      setCategories([
        { id: 0, name: "All", icon: "📦", count: products.length }, // "All" category
        ...mappedCategories,
      ]);
    } catch (error) {
      console.error("Failed to fetch categories or counts", error);
    }
  };

  // Call FetchCategoryWithCounts when the component mounts
  useEffect(() => {
    FetchCategoryWithCounts();
  }, []);

  // Filter products based on the selected category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

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
                selectedCategory === category.name
                  ? "bg-green-100 border-green-400"
                  : "bg-white border-gray-200"
              } hover:bg-green-50`}
              onClick={() => setSelectedCategory(category.name)}
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
        {filteredProducts.map((product) => (
          <div key={product.id} className="border p-4 rounded-lg shadow-lg">
            <img
              src="https://via.placeholder.com/100"
              alt={product.name}
              className="mb-4"
            />
            <h3 className="text-lg font-bold">{product.name}</h3>
            <p>{product.price}</p>
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
