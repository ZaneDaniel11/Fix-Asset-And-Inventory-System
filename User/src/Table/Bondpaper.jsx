import React, { useState } from "react";

export default function BondpaperReq() {
  const [add_modal, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openViewModal = () => setViewModalOpen(true);
  const closeViewModal = () => setViewModalOpen(false);

  const handleStatusFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const requests = [
    {
      id: 2,
      office: "CSS Department",
      date: "2017-09-26 05:57",
      purpose: "Faculty Usage",
      requestedBy: "Bruce Wayne",
      noOfPaper: 10000,
      type: "Long Bondpaper",
      status: "Pending",
    },
    {
      id: 3,
      office: "Education",
      date: "2017-09-26 05:57",
      purpose: "Faculty Usage",
      requestedBy: "Bruce Wayne",
      noOfPaper: 10000,
      type: "Long Bondpaper",
      status: "Approved",
    },
    {
      id: 4,
      office: "Criminology",
      date: "2017-09-26 05:57",
      purpose: "Faculty Usage",
      requestedBy: "Bruce Wayne",
      noOfPaper: 10000,
      type: "Long Bondpaper",
      status: "Rejected",
    },
  ];

  const filteredRequests =
    filterStatus === "All"
      ? requests
      : requests.filter((request) => request.status === filterStatus);

  return (
    <>
      <div className="limiter">
        <div className="container-table100">
          <div className="wrap-table100">
            <div className="table100">
              <div className="flex justify-between mb-4">
                <button
                  type="button"
                  onClick={openModal}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                  <i className="fa-solid fa-plus"></i> Add
                </button>
                <select
                  value={filterStatus}
                  onChange={handleStatusFilterChange}
                  className="text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <table>
                <thead>
                  <tr className="table100-head">
                    <th className="column1">Request Id</th>
                    <th className="column2">Office</th>
                    <th className="column3">Date</th>
                    <th className="column3">Purpose</th>
                    <th className="column3">Requested By</th>
                    <th className="column3">No Of Paper</th>
                    <th className="column6">Type</th>
                    <th className="column6">Status</th>
                    <td className="column6 text-white">Operation</td>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="column1">{request.id}</td>
                      <td className="column2">{request.office}</td>
                      <td className="column3">{request.date}</td>
                      <td className="column3">{request.purpose}</td>
                      <td className="column3">{request.requestedBy}</td>
                      <td className="column3">{request.noOfPaper}</td>
                      <td className="column4">{request.type}</td>
                      <td
                        className="column6"
                        style={{
                          backgroundColor:
                            request.status === "Pending"
                              ? "yellow"
                              : request.status === "Approved"
                              ? "green"
                              : "red",
                          color:
                            request.status === "Pending" ? "black" : "white",
                        }}
                      >
                        {request.status}
                      </td>
                      <td className="flex items-center justify-center mt-2">
                        <button
                          type="button"
                          onClick={openViewModal}
                          className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                        >
                          <i className="fa-regular fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {add_modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Request Form</h5>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form>
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="number"
                    placeholder="Quantity"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="date"
                    placeholder="Requested Date"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="text"
                    placeholder="Suggested Dealer"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="text"
                    placeholder="Purpose"
                  />
                  <input
                    className="bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    type="text"
                    placeholder="Estimated Cost"
                  />
                </div>
                <div className="my-4">
                  <textarea
                    placeholder="Description"
                    className="h-32 bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline w-full"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">Request Details</h5>
              <button
                type="button"
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="mt-4">
              {/* Details of the selected request */}
              <p>
                <strong>Request Id:</strong> 2
              </p>
              <p>
                <strong>Office:</strong> CSS Department
              </p>
              <p>
                <strong>Date:</strong> 2017-09-26 05:57
              </p>
              <p>
                <strong>Purpose:</strong> Faculty Usage
              </p>
              <p>
                <strong>Requested By:</strong> Bruce Wayne
              </p>
              <p>
                <strong>No Of Paper:</strong> 10000
              </p>
              <p>
                <strong>Type:</strong> Long Bondpaper
              </p>
              <p>
                <strong>Status:</strong> Pending
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
