import React from 'react';

export default function Dashboard() {
  const items = [
    { title: 'Request', count: 16 },
    { title: 'Borrowed', count: 21 },
    { title: 'Returned', count: 17 },
    { title: 'Maintenance', count: 53 },
    { title: 'Users', count: 5 },
    { title: 'Log', count: 53 },
  ];

  return (
    <div className="p-4 bg-background">
      <h1 className="text-2xl font-bold text-center mb-6 text-white">Dashboard</h1>
      <div className="flex flex-wrap justify-center">
        {items.map((item, index) => (
          <div
            key={index}
            className="m-4 p-6 rounded-lg shadow-md text-center w-64 h-32 bg-black"
          >
            <h2 className="text-white text-lg font-semibold">{item.title}</h2>
            <p className="text-white font-bold text-2xl">{item.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
