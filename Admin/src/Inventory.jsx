import React, { useState, useEffect } from "react";

export default function Inventory() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetch("http://localhost:5075/api/CategoryApi/GetCategory")
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  const handleCategoryClick = (categoryName) => {
    window.location.href = `/${categoryName}`;
  };

  const handleAddCategory = () => {
    if (!newCategory) return;

    fetch("/api/CategoryApi/InsertCategory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ CategoryName: newCategory }),
    })
      .then((response) => response.json())
      .then((data) => {
        setCategories([...categories, data]);
        setNewCategory(""); // Clear input field after adding
      })
      .catch((error) => console.error("Error adding category:", error));
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100 mx-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-8">Stocks and Inventory</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20">
          {categories.map((category) => (
            <button
              key={category.Id}
              className="bg-BlackNgadiliBlack text-white py-8 px-16 rounded-3xl shadow-md hover:bg-gray-800 transition duration-300 text-3xl"
              onClick={() => handleCategoryClick(category.categoryName)}
            >
              {category.categoryName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
