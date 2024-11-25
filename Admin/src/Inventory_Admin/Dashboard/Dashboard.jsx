import React from "react";

export default function Dashboard() {
  const icons = {
    Request: <i className="fas fa-hourglass-half"></i>,
    Borrowed: <i className="fas fa-box"></i>,
    Returned: <i className="fas fa-undo"></i>,
    Maintenance: <i className="fas fa-tools"></i>,
    Users: <i className="fas fa-users"></i>,
    Log: <i className="fas fa-book"></i>,
  };

  const items = [
    { title: "Request", count: 16 },
    { title: "Borrowed", count: 21 },
    { title: "Returned", count: 17 },
    { title: "Maintenance", count: 53 },
    { title: "Users", count: 5 },
    { title: "Log", count: 53 },
  ];

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Dashboard Header */}
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Dashboard
      </h1>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-6 bg-white border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {/* Icon */}
            <div className="flex justify-center items-center w-16 h-16 bg-gray-100 rounded-full text-3xl text-blue-500 mx-auto mb-4">
              {icons[item.title]}
            </div>

            {/* Title */}
            <h2 className="text-gray-800 text-center text-lg font-semibold mb-2">
              {item.title}
            </h2>

            {/* Count */}
            <p className="text-blue-500 text-center text-4xl font-bold">
              {item.count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
