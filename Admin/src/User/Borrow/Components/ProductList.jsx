"use client"

import { useEffect, useState } from "react"
import "../CSS/Product.css"

const API_URL = "http://localhost:5075"
// const API_URL = "https://propertycustodian-crhnakc8ejergeh5.southeastasia-01.azurewebsites.net/api/UserItemApi/"

const ProductList = ({ products, onAddProduct, setProducts }) => {
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(0)
  const [imageErrors, setImageErrors] = useState({})

  // Fetch categories with their item counts from the API
  const FetchCategoryWithCounts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/UserItemApi/GetItemCountsByCategory`)
      const result = await response.json()
      console.log("Categories Data:", result) // Debugging API response

      const mappedCategories = result.map((category) => ({
        id: category.categoryID,
        name: category.categoryName,
        icon: "📦",
        count: category.itemCount,
      }))

      setCategories([{ id: 0, name: "All", icon: "📦", count: 0 }, ...mappedCategories])
    } catch (error) {
      console.error("Failed to fetch categories or counts", error)
    }
  }

  // Fetch products by category
  const FetchProductsByCategory = async (categoryId) => {
    try {
      let response
      if (categoryId === 0) {
        response = await fetch(`${API_URL}/api/UserItemApi/GetAllItems`)
      } else {
        response = await fetch(
          `${API_URL}/api/ItemApi/GetItemsByCategory?categoryID=${categoryId}`,
        )
      }

      const result = await response.json()
      console.log("Products Data:", result) // Debugging API response

      const processedProducts = result.map((product) => ({
        ...product,
        initialQuantity: product.quantity,
        requestedQuantity: 0,
        isRequested: false, // Track if the item is requested
      }))

      setProducts(processedProducts)
    } catch (error) {
      console.error("Failed to fetch products", error)
    }
  }

  // Initial fetch for categories and all products
  useEffect(() => {
    FetchCategoryWithCounts()
    FetchProductsByCategory(0)
  }, [])

  // Fetch products whenever the selected category changes
  useEffect(() => {
    console.log("Selected Category ID:", selectedCategoryId) // Debugging category selection
    FetchProductsByCategory(selectedCategoryId)
  }, [selectedCategoryId])

  // Handle adding products and enforce quantity limit
  const handleAddProduct = (product) => {
    if (!product.isRequested && product.quantity > 0) {
      onAddProduct({
        ...product,
        requestedQuantity: 1,
      })
      setProducts(
        products.map((p) =>
          p.itemID === product.itemID
            ? {
                ...p,
                quantity: p.quantity - 1,
                isRequested: true,
                requestedQuantity: 1,
              }
            : p,
        ),
      )
    }
  }

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
          : p,
      ),
    )
  }

  const handleImageError = (itemID) => {
    setImageErrors((prev) => ({
      ...prev,
      [itemID]: true,
    }))
  }

  return (
    <div className="w-9/12 ml-4 mr-4">
      {/* Categories Section */}
      <div className="overflow-x-auto mb-6">
        <div className="flex gap-4 w-full max-w-full overflow-x-auto py-4 px-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`flex flex-col items-center p-4 w-32 min-w-[8rem] rounded-lg border shadow-md transition-all duration-300 ${
                selectedCategoryId === category.id
                  ? "bg-green-100 border-green-400 shadow-lg"
                  : "bg-white border-gray-300 hover:shadow-md hover:bg-gray-50"
              }`}
              onClick={() => setSelectedCategoryId(category.id)}
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <div className="font-semibold text-base truncate">{category.name}</div>
              <div className="text-gray-500 text-sm">{category.count} items</div>
            </button>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="overflow-y-auto max-h-[calc(5*8rem)] p-2 border rounded-lg scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.itemID}
                className="flex items-center border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 bg-white space-x-4"
              >
                {/* Image Section */}
                <div className="flex-shrink-0">
                  {!product.imageUrl || imageErrors[product.itemID] ? (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4B5563"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-500"
                      >
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.itemName}
                      className="w-24 h-24 object-cover rounded-lg"
                      onError={() => handleImageError(product.itemID)}
                    />
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{product.itemName}</h3>
                  <p className="text-gray-600 text-sm mb-2">Stocks: {product.quantity}</p>

                  {/* Out of Stock or Button */}
                  {product.quantity === 0 ? (
                    <p className="text-blue-500 font-bold">Out of Stock</p>
                  ) : product.isRequested ? (
                    <button
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg transition duration-300"
                      onClick={() => handleRemoveRequest(product.itemID)}
                    >
                      Borrowed
                    </button>
                  ) : (
                    <button
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-300"
                      onClick={() => handleAddProduct(product)}
                    >
                      Borrow
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">No products available in this category.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductList
