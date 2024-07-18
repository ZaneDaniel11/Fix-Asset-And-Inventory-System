export default function Dashboard() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">Stocks and Inventory</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20">
          <button
            className="bg-BlackNgadiliBlack text-white py-20 px-16 rounded-3xl shadow-md hover:bg-gray-800 transition duration-300 text-3xl"
            onClick={() => (window.location.href = "/Electronics")}
          >
            Electronics
          </button>
          <button
            onClick={() => (window.location.href = "/Electronics")}
            className="bg-BlackNgadiliBlack text-white py-8 px-16 rounded-3xl shadow-md hover:bg-gray-800 transition duration-300 text-3xl"
          >
            Furniture
          </button>
          <button
            onClick={() => (window.location.href = "/Electronics")}
            className="bg-BlackNgadiliBlack text-white py-8 px-16 rounded-3xl shadow-md hover:bg-gray-800 transition duration-300 text-3xl"
          >
            IT Equipment
          </button>
          <button
            onClick={() => (window.location.href = "/Electronics")}
            className="bg-BlackNgadiliBlack text-white py-20 px-20   rounded-3xl shadow-md hover:bg-gray-800 transition duration-300 text-3xl"
          >
            Office Supplies
          </button>
          <button
            onClick={() => (window.location.href = "/Electronics")}
            className="bg-BlackNgadiliBlack text-white py-8 px-16 rounded-3xl shadow-md hover:bg-gray-800 transition duration-300 text-3xl"
          >
            Maintenance Supplies
          </button>
          <button
            onClick={() => (window.location.href = "/Electronics")}
            className="bg-BlackNgadiliBlack text-white py-8 px-16 rounded-3xl shadow-md hover:bg-gray-800 transition duration-300 text-3xl"
          >
            Consumables
          </button>
        </div>
      </div>
    </div>
  );
}
