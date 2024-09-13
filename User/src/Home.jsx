import React, { useState } from "react";
import ProductList from "./components/ProductList";
import RequestSummary from "./components/RequestSummary";
import Sidebar from "./components/Sidebar";

export default function Home() {
  const [products, setProducts] = useState([]); // To store all the products
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Add product to request summary
  const handleAddProduct = (product) => {
    setSelectedProducts((prevProducts) => {
      const existingProduct = prevProducts.find(
        (p) => p.itemID === product.itemID
      );

      if (existingProduct) {
        // Increase quantity if product already in summary and below available quantity
        if (existingProduct.requestedQuantity < product.quantity) {
          return prevProducts.map((p) =>
            p.itemID === product.itemID
              ? { ...p, requestedQuantity: p.requestedQuantity + 1 }
              : p
          );
        }
      } else {
        // Add new product to summary
        return [...prevProducts, { ...product, requestedQuantity: 1 }];
      }

      return prevProducts;
    });

    // Update available quantity in the product list
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.itemID === product.itemID ? { ...p, quantity: p.quantity - 1 } : p
      )
    );
  };

  // Handle quantity change in the request summary
  const handleQuantityChange = (itemID, newQuantity) => {
    const productInList = products.find((p) => p.itemID === itemID);

    setSelectedProducts((prevProducts) =>
      prevProducts
        .map((p) =>
          p.itemID === itemID ? { ...p, requestedQuantity: newQuantity } : p
        )
        .filter((p) => p.requestedQuantity > 0)
    );

    // Update the quantity in the product list based on the new requested quantity
    if (productInList) {
      const currentRequestedQuantity =
        selectedProducts.find((p) => p.itemID === itemID)?.requestedQuantity ||
        0;

      const updatedAvailableQuantity =
        productInList.initialQuantity - newQuantity;

      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.itemID === itemID ? { ...p, quantity: updatedAvailableQuantity } : p
        )
      );
    }
  };

  return (
    <div className="flex gap-5">
      <Sidebar />
      <ProductList
        products={products}
        onAddProduct={handleAddProduct}
        setProducts={setProducts}
      />
      <RequestSummary
        selectedProducts={selectedProducts}
        onQuantityChange={handleQuantityChange}
      />
    </div>
  );
}
