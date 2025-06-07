"use client"

import { useState, useEffect } from "react"
import "../CSS/print.css"
import {
  Check,
  X,
  Clock,
  Printer,
  Eye,
  Search,
  FileText,
  User,
  Calendar,
  Tag,
  DollarSign,
  Box,
  AlertTriangle,
} from "lucide-react"

export default function Approved() {
  const [viewRequestModalOpen, setViewRequestModalOpen] = useState(false)
  const [viewBorrowModalOpen, setViewBorrowModalOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [requestItems, setRequestItems] = useState([])
  const [borrowRequests, setBorrowRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [borrowedItems, setBorrowedItems] = useState([])
  const [borrowLoading, setBorrowLoading] = useState(false)
  const [selectedTable, setSelectedTable] = useState("requestItems")
  const [isPrinting, setIsPrinting] = useState(false)

  const handleBeforePrint = () => {
    setIsPrinting(true) // Hide buttons before printing
  }

  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false) // Show buttons after printing
    }

    window.addEventListener("beforeprint", handleBeforePrint)
    window.addEventListener("afterprint", handleAfterPrint)

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint)
      window.removeEventListener("afterprint", handleAfterPrint)
    }
  }, [])

  // Updated print function with enhanced styling
  const handlePrint = () => {
    const printContent = document.getElementById("printContent")
    const printWindow = window.open("", "", "height=600,width=800")

    // Enhanced style for a more professional document
    const style = `
    <style>
      @page {
        size: A4;
        margin: 1.5cm;
      }
      
      /* Hide all headers and footers */
      @page {
        margin-top: 0;
        margin-bottom: 0;
      }
      
      html {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      body {
        font-family: 'Arial', sans-serif;
        margin: 0;
        padding: 0;
        color: #1f2937;
        line-height: 1.6;
        background-color: #fff;
      }
      
      /* Hide URL, page numbers, date */
      @media print {
        @page { margin: 0; }
        body { margin: 1.6cm; }
      }
      
      .document-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .print-header {
        text-align: center;
        margin-bottom: 30px;
        position: relative;
        padding-bottom: 15px;
      }
      
      .print-header:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 25%;
        right: 25%;
        height: 3px;
        background: linear-gradient(to right, transparent, #3b82f6, transparent);
      }
      
      .print-header h1 {
        margin: 0;
        color: #1e40af;
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      
      .print-header p {
        margin: 8px 0 0;
        color: #6b7280;
        font-size: 16px;
        font-weight: 500;
      }
      
      .document-number {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 14px;
        color: #6b7280;
        font-weight: 500;
      }
      
      .details {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        margin-bottom: 30px;
      }
      
      .details > div {
        padding: 15px;
        background-color: #f9fafb;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border-left: 4px solid #3b82f6;
        transition: transform 0.2s ease;
      }
      
      .details > div:hover {
        transform: translateY(-2px);
      }
      
      .details p {
        margin: 5px 0;
      }
      
      .details .label {
        font-weight: 600;
        color: #4b5563;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .details .value {
        font-size: 16px;
        color: #111827;
        font-weight: 500;
        margin-top: 4px;
        padding-left: 22px;
      }
      
      .approval-status {
        margin-top: 40px;
      }
      
      .approval-status h2 {
        font-size: 20px;
        color: #1f2937;
        margin-bottom: 20px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e5e7eb;
        position: relative;
      }
      
      .approval-status h2:after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 60px;
        height: 2px;
        background-color: #3b82f6;
      }
      
      .admin-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-bottom: 30px;
      }
      
      .admin-row div, .custodian-row {
        text-align: center;
        padding: 5px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        background-color: #f9fafb;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
      }
      
      .admin-row div:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.08);
      }
      
      .admin-row .status-icon {
        font-size: 10px;
        margin-bottom: 1px;
        display: inline-block;
        padding: 5px;
        border-radius: 50%;
        background-color: #f3f4f6;
      }
      
      .admin-row .admin-title {
        font-weight: 600;
        color: #4b5563;
        margin-bottom: 8px;
        font-size: 15px;
      }
      
      .admin-row .admin-status {
        font-weight: 700;
        font-size: 18px;
      }
      
      .signature-section {
        margin-top: 20px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 3rem;
      }
      
      .signature-box {
        text-align: center;
      }
      
      .signature-line {
        margin: 60px auto 15px;
        width: 80%;
        border-bottom: 1px solid #000;
      }
      
      .signature-name {
        font-weight: 700;
        margin: 0;
        font-size: 16px;
      }
      
      .signature-title {
        margin: 5px 0 0;
        font-style: italic;
        color: #6b7280;
        font-size: 14px;
      }
      
      .borrowed-items {
        margin-top: 30px;
      }
      
      .borrowed-items h3 {
        font-size: 18px;
        color: #1f2937;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .borrowed-items-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }
      
      .borrowed-item {
        padding: 15px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background-color: #f9fafb;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        transition: all 0.2s ease;
      }
      
      .borrowed-item:hover {
        background-color: #f3f4f6;
        transform: translateY(-2px);
      }
      
      .no-print {
        display: none;
      }
      
      .approved { color: #10b981; }
      .pending { color: #f59e0b; }
      .rejected { color: #ef4444; }
      
      .officials-section {
        margin-top: 40px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
      }
      
      .official-box {
        text-align: center;
        padding: 20px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        background-color: #f9fafb;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
      }
      
      .official-box:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.08);
      }
      
      .official-title {
        font-weight: 600;
        color: #4b5563;
        margin-bottom: 8px;
        font-size: 15px;
      }
      
      .official-name {
        font-weight: 700;
        font-size: 18px;
        color: #111827;
      }
      
      .official-icon {
        font-size: 28px;
        margin-bottom: 12px;
        display: inline-block;
        padding: 10px;
        border-radius: 50%;
        background-color: #f3f4f6;
        color: #3b82f6;
      }
      
      /* Hide the title/header text */
      .hide-in-print {
        display: none !important;
      }
      
      .document-footer {
        margin-top: 60px;
        text-align: center;
        font-size: 12px;
        color: #9ca3af;
        border-top: 1px solid #e5e7eb;
        padding-top: 15px;
      }
      
      .document-date {
        text-align: right;
        margin-bottom: 20px;
        font-size: 14px;
        color: #6b7280;
      }
      
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 100px;
        color: rgba(229, 231, 235, 0.5);
        z-index: -1;
        pointer-events: none;
      }
    </style>
  `
    // Remove the title and set empty title to avoid "about:blank"
    printWindow.document.write(`
    <html>
      <head>
        <title></title>
        ${style}
      </head>
      <body>
        <div class="document-container">
          <div class="document-date">Date: ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</div>
          
          <div class="print-header">
            <h1>PROPERTY CUSTODIAN DEPARTMENT</h1>
            <p>Official Approval Document</p>
          </div>
          
          <!-- Clone and modify the content to remove unwanted elements -->
          <div>${printContent.innerHTML.replace(/<h5[^>]*>.*?<\/h5>/g, "")}</div>
          
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <p class="signature-name">School President's Signature</p>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <p class="signature-name">Propert Custodian Head</p>
            </div>
          </div>
          
          <div class="document-footer">
            This is an official document of the Property Custodian Department. 
            Any unauthorized alterations will void this document.
          </div>
          
          <div class="watermark">APPROVED</div>
        </div>
        
        <script>
          // Execute immediately to hide any remaining unwanted elements
          document.addEventListener('DOMContentLoaded', function() {
            // Remove any elements with "Request Details" text
            const elements = document.querySelectorAll('*');
            for (let el of elements) {
              if (el.innerText && el.innerText.includes('Request Details')) {
                el.classList.add('hide-in-print');
              }
            }
            
            // Auto print and close to avoid seeing "about:blank"
            setTimeout(function() {
              window.print();
              window.close();
            }, 250);
          });
        </script>
      </body>
    </html>
  `)

    printWindow.document.close()

    // Focus needed for some browsers
    printWindow.focus()
  }

  // Fetch approved borrow requests (initial load)
  useEffect(() => {
    const fetchApprovedBorrowRequests = async () => {
      try {
        const response = await fetch(
          "https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/ApprovedByAdmin1",
        )
        const data = await response.json()
        setBorrowRequests(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchApprovedBorrowRequests()
  }, [])

  const fetchRequestItems = async () => {
    try {
      setLoading(true)
      fetch(
        "https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/RequestItemsApi/GetAllRequests",
      )
        .then((response) => response.json())
        .then((data) => {
          const mappedItems = data.map((item) => ({
            id: item.requestID,
            name: item.requestedItem,
            requestedBy: item.requestedBy,
            requestedDate: new Date(item.requestedDate).toLocaleString(),
            status: item.status,
            priority: item.priority,
            Admin1: item.admin1Approval,
            Admin2: item.admin2Approval,
            Admin3: item.admin3Approval,
            cost: item.estimatedCost,
            description: item.description,
            suggestedDealer: item.suggestedDealer,
          }))
          setRequestItems(mappedItems)
          console.log(mappedItems)
        })
        .catch((error) => console.error("Error fetching data:", error))
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchBorrowRequests = async () => {
    try {
      setLoading(true)
      fetch(
        "https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/AllRequests",
      )
        .then((response) => response.json())
        .then((data) => {
          const mappedItems = data.map((item) => ({
            BorrowId: item.BorrowId,
            RequestedBy: item.RequestedBy,
            ReqBorrowDate: new Date(item.ReqBorrowDate).toLocaleString(),
            Purpose: item.Purpose,
            Status: item.Status,
            Admin1Approval: item.Admin1Approval,
            Admin2Approval: item.Admin2Approval,
            Admin3Approval: item.Admin3Approval,
          }))
          setBorrowRequests(mappedItems)
        })
        .catch((error) => console.error("Error fetching data:", error))
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const openViewRequestModal = (item) => {
    setCurrentItem(item)
    setViewRequestModalOpen(true)
  }

  const openViewBorrowModal = async (item) => {
    setCurrentItem(item)
    setViewBorrowModalOpen(true)
    setBorrowLoading(true)

    try {
      const response = await fetch(
        `https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/BorrowRequestApi/ViewRequest/${item.BorrowId}`,
      )
      const data = await response.json()
      setBorrowedItems(data)
    } catch (error) {
      console.error("Error fetching borrowed items:", error)
    } finally {
      setBorrowLoading(false)
    }
  }

  const handleTableChange = (table) => {
    setSelectedTable(table)
    if (table === "requestItems") {
      fetchRequestItems()
    } else if (table === "borrowRequests") {
      fetchBorrowRequests()
    }
  }

  const filteredItems = requestItems.filter(
    (item) =>
      item.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (item.Admin3 === "Approved" || item.Admin3 === "Declined") &&
      item.Admin2 === "Approved",
  )

  const filteredItems1 = borrowRequests.filter(
    (item) =>
      item.RequestedBy.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (item.Admin3Approval === "Approved" || item.Admin3Approval === "Declined") &&
      item.Admin2Approval === "Approved",
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg font-medium text-gray-700">Loading data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 p-6 rounded-lg">
        <div className="text-red-500 text-xl font-semibold">
          <AlertTriangle className="h-8 w-8 inline mr-2" />
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 p-6 bg-gray-50">
        <div className="container mx-auto bg-white shadow-lg rounded-xl p-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 shadow-lg rounded-xl mb-6 text-center">
            <h2 className="text-2xl font-bold text-white">Approved Requests Overview</h2>
          </div>

          <div className="flex justify-between mb-6 shadow-lg p-6 bg-white rounded-xl">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by Requester Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 p-3 w-full border rounded-lg shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                onClick={() => handleTableChange("requestItems")}
                className={`px-5 py-3 text-sm font-medium rounded-l-lg transition-all duration-200 ${
                  selectedTable === "requestItems"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Box className="h-4 w-4 inline mr-2" />
                Request Items
              </button>

              <button
                onClick={() => handleTableChange("borrowRequests")}
                className={`px-5 py-3 text-sm font-medium rounded-r-lg transition-all duration-200 ${
                  selectedTable === "borrowRequests"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Borrow Requests
              </button>
            </div>
          </div>

          {selectedTable === "requestItems" ? (
            <div className="overflow-x-auto shadow-xl rounded-xl">
              <table className="min-w-full border-collapse bg-white">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      ID
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Item Name
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Requested By
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Date
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Priority
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Inventory
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Head
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      School
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.requestedBy}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.requestedDate}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : item.status === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.status === "Approved" ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : item.status === "Rejected" ? (
                              <X className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.priority === "High"
                                ? "bg-red-100 text-red-800"
                                : item.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.Admin1 === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.Admin1 === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : item.Admin1 === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.Admin1 === "Approved" ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : item.Admin1 === "Rejected" ? (
                              <X className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {item.Admin1}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.Admin2 === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.Admin2 === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : item.Admin2 === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.Admin2 === "Approved" ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : item.Admin2 === "Rejected" ? (
                              <X className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {item.Admin2}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.Admin3 === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.Admin3 === "Declined"
                                  ? "bg-red-100 text-red-800"
                                  : item.Admin3 === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.Admin3 === "Approved" ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : item.Admin3 === "Declined" ? (
                              <X className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {item.Admin3}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => openViewRequestModal(item)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto shadow-xl rounded-xl">
              <table className="min-w-full border-collapse bg-white">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      ID
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Requested By
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Borrow Date
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Purpose
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Inventory
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Head
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      School
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems1.map((item) => {
                    return (
                      <tr key={item.BorrowId} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">{item.BorrowId}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.RequestedBy}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.ReqBorrowDate}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.Purpose}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.Status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.Status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : item.Status === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.Status === "Approved" ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : item.Status === "Rejected" ? (
                              <X className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {item.Status}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.Admin1Approval === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.Admin1Approval === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : item.Admin1Approval === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.Admin1Approval === "Approved" ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : item.Admin1Approval === "Rejected" ? (
                              <X className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {item.Admin1Approval}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.Admin2Approval === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.Admin2Approval === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : item.Admin2Approval === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.Admin2Approval === "Approved" ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : item.Admin2Approval === "Rejected" ? (
                              <X className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {item.Admin2Approval}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.Admin3Approval === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.Admin3Approval === "Declined"
                                  ? "bg-red-100 text-red-800"
                                  : item.Admin3Approval === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.Admin3Approval === "Approved" ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : item.Admin3Approval === "Declined" ? (
                              <X className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {item.Admin3Approval}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => openViewBorrowModal(item)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Request Item Modal */}
          {viewRequestModalOpen && currentItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div id="printContent" className="bg-white p-8 rounded-xl max-w-3xl w-full mx-4 md:mx-0 shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b pb-4 hide-in-print">
                  <h5 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Eye className="h-6 w-6 mr-3 text-blue-500" />
                    Request Details
                  </h5>
                  <button
                    type="button"
                    onClick={() => setViewRequestModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 no-print"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Item Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8 border rounded-lg p-6 bg-gray-50 details">
                  <div>
                    <p className="text-lg font-semibold text-gray-600 flex items-center label">
                      <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                      Estimated Cost
                    </p>
                    <p className="text-xl text-gray-800 value">{currentItem.cost}</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-600 flex items-center label">
                      <Box className="h-5 w-5 mr-2 text-blue-500" />
                      Item Name
                    </p>
                    <p className="text-xl text-gray-800 value">{currentItem.name}</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-600 flex items-center label">
                      <Tag className="h-5 w-5 mr-2 text-yellow-500" />
                      Suggested Dealer
                    </p>
                    <p className="text-xl text-gray-800 value">{currentItem.suggestedDealer}</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-600 flex items-center label">
                      <FileText className="h-5 w-5 mr-2 text-gray-500" />
                      Item Description
                    </p>
                    <p className="text-xl text-gray-800 value">{currentItem.description}</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-600 flex items-center label">
                      <User className="h-5 w-5 mr-2 text-purple-500" />
                      Requested By
                    </p>
                    <p className="text-xl text-gray-800 value">{currentItem.requestedBy}</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-600 flex items-center label">
                      <Calendar className="h-5 w-5 mr-2 text-red-500" />
                      Requested Date
                    </p>
                    <p className="text-xl text-gray-800 value">
                      {new Date(currentItem.requestedDate).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-600 flex items-center label">
                      <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                      Priority
                    </p>
                    <p
                      className={`text-xl font-semibold value ${
                        currentItem.priority === "High"
                          ? "text-red-600"
                          : currentItem.priority === "Medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {currentItem.priority}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-600 flex items-center label">
                      <FileText className="h-5 w-5 mr-2 text-teal-500" />
                      Status
                    </p>
                    <p
                      className={`text-xl font-semibold value ${
                        currentItem.status === "Approved"
                          ? "text-green-600"
                          : currentItem.status === "In Progress"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {currentItem.status === "Approved" ? (
                        <Check className="h-5 w-5 mr-2 inline" />
                      ) : currentItem.status === "In Progress" ? (
                        <Clock className="h-5 w-5 mr-2 inline animate-pulse" />
                      ) : (
                        <X className="h-5 w-5 mr-2 inline" />
                      )}
                      {currentItem.status}
                    </p>
                  </div>
                </div>

                {/* Approval Status */}
                <div className="approval-status">
  <h2 className="text-lg font-semibold text-gray-700 mb-4">Approval Status</h2>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 admin-row">
    {[
      { title: "Inventory Admin", status: currentItem.Admin1 },
      { title: "Head Admin", status: currentItem.Admin2 },
      { title: "School Admin", status: currentItem.Admin3 },
    ].map(({ title, status }, idx) => (
      <div key={idx} className="flex flex-col items-center bg-gray-50 p-4 rounded-lg shadow">
        <div
          className={`status-icon ${
            status === "Approved"
              ? "bg-green-100 text-green-600"
              : status === "Rejected"
              ? "bg-red-100 text-red-600"
              : "bg-yellow-100 text-yellow-600"
          } `}
        >
          {status === "Approved"}
        </div>
        <p className="text-sm text-gray-700 font-medium mt-2">{title}</p>
        <span
          className={`text-base font-semibold ${
            status === "Approved"
              ? "text-green-600"
              : status === "Rejected"
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          {status}
        </span>
      </div>
    ))}
  </div>


                  {/* Officials Section */}
                  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 officials-section">
                    <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow-md official-box">
                      <div className="official-icon">
                        <User className="h-6 w-6" />
                      </div>
                      <p className="text-lg text-gray-700 font-medium official-title">President</p>
                      <span className="text-xl font-semibold text-gray-800 official-name">Victor Elliot Lepiten</span>
                    </div>

                    <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow-md official-box">
                      <div className="official-icon">
                        <User className="h-6 w-6" />
                      </div>
                      <p className="text-lg text-gray-700 font-medium official-title">Property Custodian Head</p>
                      <span className="text-xl font-semibold text-gray-800 official-name">Jingle Boy Lepiten</span>
                    </div>
                  </div> */}
                </div>

                {/* Print and Close Buttons */}
                {!isPrinting && (
                  <div className="flex justify-between mt-8 no-print">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                    >
                      <Printer className="h-5 w-5 mr-2" /> Print
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewRequestModalOpen(false)}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <X className="h-5 w-5 mr-2" /> Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Borrow Request Modal */}
          {viewBorrowModalOpen && currentItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div id="printContent" className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8 relative">
                {/* Close Button */}
                <button
                  onClick={() => setViewBorrowModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl no-print hide-in-print"
                >
                  <X className="h-6 w-6" />
                </button>
                {/* Modal Title */}
                <h2 className="text-3xl font-bold text-gray-700 text-center mb-8 hide-in-print">
                  Borrow Request Details
                </h2>
                {/* Borrow Request Details */}
                <div className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-6 bg-gray-50 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">ID</span>
                        <p className="font-semibold">{currentItem.BorrowId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Requested By</span>
                        <p className="font-semibold">{currentItem.RequestedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Request Date</span>
                        <p className="font-semibold">{currentItem.ReqBorrowDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <FileText className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Purpose</span>
                        <p className="font-semibold">{currentItem.Purpose}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 md:col-span-2">
                      <div className="bg-teal-100 p-2 rounded-full">
                        <FileText className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Status</span>
                        <p
                          className={`font-semibold flex items-center ${
                            currentItem.Status === "Approved"
                              ? "text-green-600"
                              : currentItem.Status === "Rejected"
                                ? "text-red-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {currentItem.Status === "Approved" ? (
                            <Check className="h-4 w-4 mr-1" />
                          ) : currentItem.Status === "Rejected" ? (
                            <X className="h-4 w-4 mr-1" />
                          ) : (
                            <Clock className="h-4 w-4 mr-1" />
                          )}
                          {currentItem.Status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <hr className="my-6 border-gray-200" />
                {/* Approval Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow-md">
                    <div
                      className={`status-icon ${
                        currentItem.Admin1Approval === "Approved"
                          ? "bg-green-100 text-green-600"
                          : currentItem.Admin1Approval === "Rejected"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {currentItem.Admin1Approval === "Approved" ? (
                        <Check className="h-6 w-6" />
                      ) : currentItem.Admin1Approval === "Rejected" ? (
                        <X className="h-6 w-6" />
                      ) : (
                        <Clock className="h-6 w-6" />
                      )}
                    </div>
                    <p className="text-lg text-gray-700 font-medium admin-title">Inventory Admin</p>
                    <span
                      className={`text-xl font-semibold admin-status ${
                        currentItem.Admin1Approval === "Approved"
                          ? "text-green-600"
                          : currentItem.Admin1Approval === "Rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {currentItem.Admin1Approval}
                    </span>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow-md">
                    <div
                      className={`status-icon ${
                        currentItem.Admin2Approval === "Approved"
                          ? "bg-green-100 text-green-600"
                          : currentItem.Admin2Approval === "Rejected"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {currentItem.Admin2Approval === "Approved" ? (
                        <Check className="h-6 w-6" />
                      ) : currentItem.Admin2Approval === "Rejected" ? (
                        <X className="h-6 w-6" />
                      ) : (
                        <Clock className="h-6 w-6" />
                      )}
                    </div>
                    <p className="text-lg text-gray-700 font-medium admin-title">Head Admin</p>
                    <span
                      className={`text-xl font-semibold admin-status ${
                        currentItem.Admin2Approval === "Approved"
                          ? "text-green-600"
                          : currentItem.Admin2Approval === "Rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {currentItem.Admin2Approval}
                    </span>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow-md">
                    <div
                      className={`status-icon ${
                        currentItem.Admin3Approval === "Approved"
                          ? "bg-green-100 text-green-600"
                          : currentItem.Admin3Approval === "Declined"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {currentItem.Admin3Approval === "Approved" ? (
                        <Check className="h-6 w-6" />
                      ) : currentItem.Admin3Approval === "Declined" ? (
                        <X className="h-6 w-6" />
                      ) : (
                        <Clock className="h-6 w-6" />
                      )}
                    </div>
                    <p className="text-lg text-gray-700 font-medium admin-title">School Admin</p>
                    <span
                      className={`text-xl font-semibold admin-status ${
                        currentItem.Admin3Approval === "Approved"
                          ? "text-green-600"
                          : currentItem.Admin3Approval === "Declined"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {currentItem.Admin3Approval}
                    </span>
                  </div>
                </div>

                {/* Officials Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 officials-section">
                  <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow-md official-box">
                    <div className="official-icon">
                      <User className="h-6 w-6" />
                    </div>
                    <p className="text-lg text-gray-700 font-medium official-title">President</p>
                    <span className="text-xl font-semibold text-gray-800 official-name">Victor Elliot Lepiten</span>
                  </div>

                  <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow-md official-box">
                    <div className="official-icon">
                      <User className="h-6 w-6" />
                    </div>
                    <p className="text-lg text-gray-700 font-medium official-title">Property Custodian Head</p>
                    <span className="text-xl font-semibold text-gray-800 official-name">Jingle Boy Lepiten</span>
                  </div>
                </div>
                <hr className="my-6 border-gray-200" />
                {/* Borrowed Items Section */}
                <h4 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <Box className="h-5 w-5 text-green-600" /> Borrowed Items
                </h4>
                {borrowLoading ? (
                  <div className="flex items-center justify-center p-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                    <span>Loading borrowed items...</span>
                  </div>
                ) : borrowedItems.length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 rounded-xl text-gray-500 text-lg">
                    No borrowed items found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 borrowed-items-grid">
                    {borrowedItems.map((item) => (
                      <div
                        key={item.ItemId}
                        className="border border-gray-200 rounded-lg p-5 bg-gray-50 hover:shadow-lg transition-shadow duration-300 borrowed-item"
                      >
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <Box className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <span className="text-gray-800 font-semibold block">{item.ItemName}</span>
                            <span className="text-sm text-gray-500">Quantity: {item.Quantity}x</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Print Button */}
                <div className="flex justify-center mt-8 no-print">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                  >
                    <Printer className="h-5 w-5 mr-2" /> Print Document
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
