import React, { useState } from "react";

export default function RequestTable() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [add_modal, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closeDeleteModal = () => setDeleteModalOpen(false);

  return (
    <>
      <div className="limiter">
        <div className="container-table100">
          <div className="wrap-table100">
            <div className="table100">
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={openModal}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                  <i className="fa-solid fa-plus"></i> Add
                </button>
              </div>
              <table>
                <thead>
                  <tr className="table100-head">
                    <th className="column1">Item ID</th>
                    <th className="column2">Requested by</th>
                    <th className="column3">Requested Date</th>
                    <th className="column4">Suggested Dealer</th>
                    <th className="column5">Purpose</th>
                    <th className="column6">Estimated Cost</th>
                    <th className="column6">Status</th>
                    <td className="column6">Operation</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="column1">2</td>
                    <td className="column2">CSS Department</td>
                    <td className="column3">2017-09-26 05:57</td>
                    <td className="column4">Bruce Wayne</td>
                    <td className="column4">For P.E</td>
                    <td className="column4">10000</td>
                    <td className="column6">Pending</td>

                    <td className="flex items-center justify-center mt-2">
                      <button
                        type="button"
                        onClick={openModal}
                        className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-2"
                      >
                        <i className="fa-regular fa-eye"></i>
                      </button>
                    </td>
                  </tr>
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
    </>
  );
}
