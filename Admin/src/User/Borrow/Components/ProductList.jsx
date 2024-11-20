import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5075/api/UserItemApi/";

const ProductList = ({ products, onAddProduct, setProducts }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);

  // Fetch categories with their item counts from the API
  const FetchCategoryWithCounts = async () => {
    try {
      const response = await fetch(`${API_URL}GetItemCountsByCategory`);
      const result = await response.json();

      const mappedCategories = result.map((category) => ({
        id: category.categoryID,
        name: category.categoryName,
        icon: "📦",
        count: category.itemCount,
      }));

      setCategories([
        { id: 0, name: "All", icon: "📦", count: 0 },
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
        response = await fetch(`${API_URL}GetAllItems`);
      } else {
        response = await fetch(
          `${API_URL}GetItemsByCategory?categoryID=${categoryId}`
        );
      }

      const result = await response.json();
      const processedProducts = result.map((product) => ({
        ...product,
        initialQuantity: product.quantity,
        requestedQuantity: 0,
        isRequested: false, // Track if the item is requested
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

  // Handle adding products and enforce quantity limit
  const handleAddProduct = (product) => {
    if (!product.isRequested && product.quantity > 0) {
      onAddProduct({
        ...product,
        requestedQuantity: 1,
      });
      setProducts(
        products.map((p) =>
          p.itemID === product.itemID
            ? {
                ...p,
                quantity: p.quantity - 1,
                isRequested: true,
                requestedQuantity: 1,
              }
            : p
        )
      );
    }
  };

  const handleRemoveRequest = (productId) => {
    setProducts(
      products.map((p) =>
        p.itemID === productId
          ? {
              ...p,
              isRequested: false,
              quantity: p.initialQuantity,
              requestedQuantity: 0,
            }
          : p
      )
    );
  };

  return (
    <div className="w-full ml-4">
      {/* Categories Section */}
      <div className="overflow-x-auto mb-6">
        <div className="flex gap-4 w-full max-w-full overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`flex flex-col items-center p-4 w-28 min-w-max rounded-lg border shadow-md ${
                selectedCategoryId === category.id
                  ? "bg-green-100 border-green-400"
                  : "bg-white border-gray-200"
              } hover:bg-green-50 transition-all duration-300`}
              onClick={() => setSelectedCategoryId(category.id)}
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

      {/* Products Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.itemID}
            className="flex items-center border p-4 rounded-lg shadow-lg space-x-4"
          >
            {/* Image Section */}
            <div className="flex-shrink-0">
              <img
                src="https://via.placeholder.com/100"
                alt={product.itemName}
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>

            {/* Content Section */}
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-800">
                {product.itemName}
              </h3>
              <p className="text-lg text-gray-600 mb-2">
                Quantity: {product.quantity}
              </p>

              {/* Out of Stock or Button */}
              {product.quantity === 0 ? (
                <p className="text-red-500 font-bold">Out of Stock</p>
              ) : product.isRequested ? (
                <button
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg transition duration-300"
                  onClick={() => handleRemoveRequest(product.itemID)}
                >
                  Requested
                </button>
              ) : (
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-300"
                  onClick={() => handleAddProduct(product)}
                >
                  Request
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
