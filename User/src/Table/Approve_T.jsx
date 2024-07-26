import React, { useState } from "react";

export default function ApprovedRequests() {
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const openViewModal = () => setViewModalOpen(true);
  const closeViewModal = () => setViewModalOpen(false);

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

  const approvedRequests = requests.filter(
    (request) => request.status === "Approved"
  );

  return (
    <>
      <div className="limiter">
        <div className="container-table100">
          <div className="wrap-table100">
            <div className="table100">
              <h3 className="text-lg font-semibold mt-10 mb-4">
                Approved Requests
              </h3>
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
                  {approvedRequests.map((request) => (
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
                          backgroundColor: "#90EE90", // Light Green for Approved
                          color: "white",
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

      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 md:mx-0">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-semibold">View Request</h5>
              <button
                type="button"
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="mt-4">
              {/* Replace these details with dynamic content if needed */}
              <p>
                <strong>Request Id:</strong> 3
              </p>
              <p>
                <strong>Office:</strong> Education
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
                <strong>Status:</strong> Approved
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
