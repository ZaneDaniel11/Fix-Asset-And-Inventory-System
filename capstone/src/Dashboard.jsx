export default function Dashboard() {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Stocks and Inventory</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20">
            <button className="bg-black text-white py-20 px-16 rounded-lg shadow-md hover:bg-gray-800 transition duration-300">
              Electronics
            </button>
            <button className="bg-black text-white py-8 px-16 rounded-lg shadow-md hover:bg-gray-800 transition duration-300">
              Furniture
            </button>
            <button className="bg-black text-white py-8 px-16 rounded-lg shadow-md hover:bg-gray-800 transition duration-300">
              IT Equipment
            </button>
            <button onClick={() => window.location.href = "/sample"} className="bg-black text-white py-20 px-20   rounded-lg shadow-md hover:bg-gray-800 transition duration-300">
              Office Supplies
            </button>
            <button className="bg-black text-white py-8 px-16 rounded-lg shadow-md hover:bg-gray-800 transition duration-300">
              Maintenance Supplies
            </button>
            <button className="bg-black text-white py-8 px-16 rounded-lg shadow-md hover:bg-gray-800 transition duration-300">
              Consumables
            </button>
          </div>
        </div>
      </div>
    );
  }
  