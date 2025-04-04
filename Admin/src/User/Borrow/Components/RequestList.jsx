"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ClipboardList,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  FileText,
  Tag,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function RequestList() {
  const [requests, setRequests] = useState([])
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const API_URL = "http://localhost:5075/api/BorrowRequestApi"

  // Function to group requests by BorrowId
  const groupRequestsByBorrowId = (data) => {
    const groupedRequests = data.reduce((acc, curr) => {
      const { BorrowId, ItemName, Quantity } = curr

      if (!acc[BorrowId]) {
        // Initialize a new request entry with common details and an empty items array
        acc[BorrowId] = {
          ...curr,
          Items: [],
        }
      }

      // Push each item into the corresponding BorrowId group
      acc[BorrowId].Items.push({ ItemName, Quantity })

      return acc
    }, {})

    // Return the grouped requests as an array
    return Object.values(groupedRequests)
  }

  const getRequests = async () => {
    setIsLoading(true)
    try {
      const borrowerId = localStorage.getItem("userId")

      if (!borrowerId) {
        throw new Error("User ID not found in localStorage")
      }

      // Fetch requests by borrowerId
      const response = await fetch(`${API_URL}/RequestsByBorrowerId?borrowerId=${borrowerId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch requests")
      }

      const result = await response.json()
      const groupedRequests = groupRequestsByBorrowId(result)
      setRequests(groupedRequests) // Set grouped borrow requests
    } catch (error) {
      console.error("Error fetching requests", error)
    } finally {
      setIsLoading(false)
    }
  }

  const viewRequest = (request) => {
    setSelectedRequestDetails(request) // Set the entire request object
    setIsModalOpen(true) // Open modal
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedRequestDetails(null) // Clear request details
  }

  useEffect(() => {
    getRequests()
  }, [])

  // Function to get status badge variant
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success"
      case "rejected":
        return "destructive"
      case "pending":
        return "warning"
      case "returned":
        return "default"
      default:
        return "secondary"
    }
  }

  // Function to get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "returned":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-purple-50 min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-8 p-6 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl text-white"
        >
          <div className="bg-white/20 p-3 rounded-full mr-4">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Borrow Requests</h1>
            <p className="text-purple-100">Track and manage your item requests</p>
          </div>
        </motion.div>

        <Card className="border-indigo-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl">
            <CardTitle>Request History</CardTitle>
            <CardDescription className="text-indigo-100">View and manage your borrow requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : requests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.BorrowId}>
                      <TableCell className="font-medium">#{request.BorrowId}</TableCell>
                      <TableCell>{request.RequestedBy}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{request.Purpose || "N/A"}</TableCell>
                      <TableCell>{formatDate(request.ReqBorrowDate)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            request.Status?.toLowerCase() === "approved"
                              ? "bg-green-100 text-green-800"
                              : request.Status?.toLowerCase() === "rejected"
                                ? "bg-red-100 text-red-800"
                                : request.Status?.toLowerCase() === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : request.Status?.toLowerCase() === "returned"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {getStatusIcon(request.Status)}
                          <span className="ml-1">{request.Status || "Unknown"}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewRequest(request)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">No requests found</h3>
                <p className="text-muted-foreground max-w-md">
                  You haven't made any borrow requests yet. Start by browsing items and requesting what you need.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Details Dialog */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-lg -mt-6 -mx-6 mb-6">
              <DialogTitle className="text-2xl">
                Request Details <span className="text-indigo-200">#{selectedRequestDetails?.BorrowId}</span>
              </DialogTitle>
              <DialogDescription className="text-indigo-100">View the details of your borrow request</DialogDescription>
            </DialogHeader>

            {selectedRequestDetails && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-muted-foreground">Requested By</p>
                        <p className="font-medium">{selectedRequestDetails.RequestedBy}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-muted-foreground">Request Date</p>
                        <p className="font-medium">{formatDate(selectedRequestDetails.ReqBorrowDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-muted-foreground">Purpose</p>
                        <p className="font-medium">{selectedRequestDetails.Purpose || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Tag className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge
                          variant={getStatusVariant(selectedRequestDetails.Status)}
                          className="flex w-fit items-center gap-1"
                        >
                          {getStatusIcon(selectedRequestDetails.Status)}
                          <span>{selectedRequestDetails.Status || "Unknown"}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Requested Items</h3>
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRequestDetails.Items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.ItemName}</TableCell>
                            <TableCell>{item.Quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={closeModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

