"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, AlertCircle } from "lucide-react"
import "../CSS/Product.css"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const API_URL = "http://localhost:5075/api/UserItemApi/"

const ProductList = ({ products, onAddProduct, setProducts }) => {
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Fetch categories with their item counts from the API
  const fetchCategoryWithCounts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}GetItemCountsByCategory`)
      const result = await response.json()

      const mappedCategories = result.map((category) => ({
        id: category.categoryID,
        name: category.categoryName,
        icon: getCategoryIcon(category.categoryName),
        count: category.itemCount,
      }))

      setCategories([{ id: 0, name: "All Items", icon: "📦", count: getTotalItemCount(result) }, ...mappedCategories])
    } catch (error) {
      console.error("Failed to fetch categories or counts", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get total item count across all categories
  const getTotalItemCount = (categories) => {
    return categories.reduce((total, category) => total + category.itemCount, 0)
  }

  // Get appropriate icon based on category name
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase()
    if (name.includes("electronic")) return "🔌"
    if (name.includes("office")) return "📎"
    if (name.includes("tool")) return "🔧"
    if (name.includes("book")) return "📚"
    if (name.includes("lab")) return "🧪"
    if (name.includes("sport")) return "🏀"
    return "📦" // Default icon
  }

  // Fetch products by category
  const fetchProductsByCategory = async (categoryId) => {
    setIsLoading(true)
    try {
      let response
      if (categoryId === 0) {
        response = await fetch(`${API_URL}GetAllItems`)
      } else {
        response = await fetch(`http://localhost:5075/api/ItemApi/GetItemsByCategory?categoryID=${categoryId}`)
      }

      const result = await response.json()

      const processedProducts = result.map((product) => ({
        ...product,
        initialQuantity: product.quantity,
        requestedQuantity: 0,
        isRequested: false,
      }))

      setProducts(processedProducts)
    } catch (error) {
      console.error("Failed to fetch products", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch for categories and all products
  useEffect(() => {
    fetchCategoryWithCounts()
    fetchProductsByCategory(0)
  }, [])

  // Fetch products whenever the selected category changes
  useEffect(() => {
    fetchProductsByCategory(selectedCategoryId)
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

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.itemName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="w-full lg:w-8/12 space-y-6">
      <Card>
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
          <h2 className="text-2xl font-bold">Available Items</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
            <Input
              type="text"
              className="pl-9 border-blue-200 focus:border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categories Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Categories</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Filter className="h-4 w-4 mr-1" />
                <span>Filter</span>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
              {isLoading
                ? Array(5)
                    .fill(0)
                    .map((_, index) => <Skeleton key={index} className="min-w-[100px] h-[100px] rounded-lg" />)
                : categories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center justify-center p-3 min-w-[100px] h-[100px] rounded-lg border-2 transition-all ${
                        selectedCategoryId === category.id
                          ? "border-blue-500 bg-blue-100 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                      onClick={() => setSelectedCategoryId(category.id)}
                    >
                      <span className="text-3xl mb-2">{category.icon}</span>
                      <span className="font-medium text-sm text-center line-clamp-1">{category.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">{category.count} items</span>
                    </motion.button>
                  ))}
            </div>
          </div>

          {/* Products Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Items</h3>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <Skeleton className="h-40 w-full" />
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-9 w-full" />
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.itemID}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden h-full flex flex-col border-blue-100 hover:border-blue-300 transition-all hover:shadow-md hover:shadow-blue-100">
                      <div className="relative h-40 bg-muted">
                        <img
                          src={product.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"}
                          alt={product.itemName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x200?text=No+Image"
                          }}
                        />
                        {product.quantity === 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">Out of Stock</span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4 flex-grow">
                        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{product.itemName}</h3>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-muted-foreground">
                            Available: <span className="font-medium">{product.quantity}</span>
                          </span>
                          {product.categoryName && (
                            <Badge variant="outline" className="text-xs border-blue-300 bg-blue-50 text-blue-700">
                              {product.categoryName}
                            </Badge>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-0">
                        {product.quantity === 0 ? (
                          <Button disabled variant="outline" className="w-full">
                            Out of Stock
                          </Button>
                        ) : product.isRequested ? (
                          <Button
                            variant="secondary"
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                            onClick={() => handleRemoveRequest(product.itemID)}
                          >
                            Remove Request
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            onClick={() => handleAddProduct(product)}
                          >
                            Borrow Item
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No items found</h3>
                <p className="text-muted-foreground max-w-md">
                  {searchTerm
                    ? `No items match your search "${searchTerm}". Try a different search term.`
                    : "No items available in this category."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProductList

