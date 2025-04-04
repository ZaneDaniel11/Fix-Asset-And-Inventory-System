
import { useState } from "react"
import ProductList from "./Components/ProductList"
import RequestSummary from "./Components/RequestSummary"
import { motion } from "framer-motion"
import { BookOpen } from "lucide-react"

export default function Borrow() {
  const [products, setProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])

  // Add product to request summary
  const handleAddProduct = (product) => {
    setSelectedProducts((prevProducts) => {
      const existingProduct = prevProducts.find((p) => p.itemID === product.itemID)

      if (existingProduct) {
        // Increase quantity if product already in summary and below available quantity
        if (existingProduct.requestedQuantity < product.quantity) {
          return prevProducts.map((p) =>
            p.itemID === product.itemID ? { ...p, requestedQuantity: p.requestedQuantity + 1 } : p,
          )
        }
      } else {
        // Add new product to summary
        return [...prevProducts, { ...product, requestedQuantity: 1 }]
      }

      return prevProducts
    })

    // Update available quantity in the product list
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.itemID === product.itemID ? { ...p, quantity: p.quantity - 1 } : p)),
    )
  }

  // Handle quantity change in the request summary
  const handleQuantityChange = (itemID, newQuantity) => {
    const productInList = products.find((p) => p.itemID === itemID)

    setSelectedProducts((prevProducts) =>
      prevProducts
        .map((p) => (p.itemID === itemID ? { ...p, requestedQuantity: newQuantity } : p))
        .filter((p) => p.requestedQuantity > 0),
    )

    // Update the quantity in the product list based on the new requested quantity
    if (productInList) {
      const currentRequestedQuantity = selectedProducts.find((p) => p.itemID === itemID)?.requestedQuantity || 0

      const updatedAvailableQuantity = productInList.initialQuantity - newQuantity

      setProducts((prevProducts) =>
        prevProducts.map((p) => (p.itemID === itemID ? { ...p, quantity: updatedAvailableQuantity } : p)),
      )
    }
  }

  // Handle removing a product from the request summary
  const handleRemoveProduct = (itemID) => {
    const productInRequest = selectedProducts.find((p) => p.itemID === itemID)
    if (productInRequest) {
      // Update product quantity in the ProductList based on removed quantity
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.itemID === itemID
            ? {
                ...p,
                quantity: p.quantity + productInRequest.requestedQuantity,
                isRequested: false,
              }
            : p,
        ),
      )

      // Remove the product from selectedProducts
      setSelectedProducts((prevProducts) => prevProducts.filter((p) => p.itemID !== itemID))
    }
  }

  // New function to reset selected products after request completion
  const handleRequestCompleted = () => {
    setSelectedProducts([]) // Clear all selected products

    // Reset all products to their initial state
    setProducts((prevProducts) =>
      prevProducts.map((p) => ({
        ...p,
        quantity: p.initialQuantity,
        isRequested: false,
        requestedQuantity: 0,
      })),
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-8"
        >
          <div className="bg-primary p-3 rounded-full mr-4">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Borrow Items</h1>
            <p className="text-muted-foreground">Browse and request items from our inventory</p>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row">
          <ProductList products={products} onAddProduct={handleAddProduct} setProducts={setProducts} />
          <RequestSummary
            selectedProducts={selectedProducts}
            onQuantityChange={handleQuantityChange}
            onRemoveProduct={handleRemoveProduct}
            onRequestCompleted={handleRequestCompleted}
          />
        </div>
      </div>
    </div>
  )
}

