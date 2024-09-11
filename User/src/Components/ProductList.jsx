import React from "react";

const ProductList = () => {
  const products = [
    { id: 1, name: "Tasty Vegetable Salad", price: "$11.99" },
    { id: 2, name: "Original Cheese Burger", price: "$12.99" },
    { id: 3, name: "Taco Salad With Chicken", price: "$9.99" },
  ];

  return (
    <div className="w-2/3">
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded-lg shadow-lg">
            <img
              src={`https://via.placeholder.com/100`}
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
