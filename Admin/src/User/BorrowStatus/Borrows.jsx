"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Eye, Ban, BadgeIcon as IdCard, User, Calendar, Target, Info, Package, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function BorrowStatus() {
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [statusQuery, setStatusQuery] = useState("")
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [borrowedItems, setBorrowedItems] = useState([])
  const [borrowLoading, setBorrowLoading] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    const fetchBorrowRequests = async () => {
      const borrowerId = localStorage.getItem("userId")

      if (!borrowerId) {
        setError("User ID is not available in localStorage")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`http://localhost:5075/api/BorrowRequestApi/RequestById/${borrowerId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch borrow requests")
        }

        const data = await response.json()
        setItems(Array.isArray(data) ? data : [data])
        console.log(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBorrowRequests()
  }, [])

  const fetchBorrowItems = async (borrowId) => {
    setBorrowLoading(true)
    try {
      const response = await fetch(`http://localhost:5075/api/BorrowRequestApi/ViewRequest/${borrowId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch borrowed items")
      }
      const data = await response.json()
      setBorrowedItems(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setBorrowLoading(false)
    }
  }

  const openViewModal = (item) => {
    setCurrentItem(item)
    setViewModalOpen(true)
    fetchBorrowItems(item.BorrowId)
  }

  const closeViewModal = () => {
    setViewModalOpen(false)
    setCurrentItem(null)
    setBorrowedItems([])
  }

  const openCancelModal = (item) => {
    setCurrentItem(item)
    setCancelModalOpen(true)
  }

  const closeCancelModal = () => {
    setCancelModalOpen(false)
    setCurrentItem(null)
  }

  const cancelRequest = async () => {
    if (!currentItem) return

    setCanceling(true)
    try {
      const response = await fetch("http://localhost:5075/api/BorrowRequestApi/CancelRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ borrowId: currentItem.BorrowId }),
      })
      toast.error("Borrow Canceled")
      if (!response.ok) {
        throw new Error("Failed to cancel the request")
      }

      // Update the UI to reflect the cancellation
      setItems((prevItems) =>
        prevItems.map((item) => (item.BorrowId === currentItem.BorrowId ? { ...item, Status: "Canceled" } : item)),
      )

      closeCancelModal()
    } catch (error) {
      setError(error.message)
    } finally {
      setCanceling(false)
    }
  }

  const filteredItems = Array.isArray(items)
    ? items.filter((item) => item.Status === "Pending" || item.Status === "In Progress")
    : []

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600"
      case "Canceled":
        return "text-red-600"
      case "In Progress":
        return "text-blue-600"
      case "Rejected":
        return "text-red-600"
      case "Approved":
        return "text-green-500"
      default:
        return "text-green-600"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
          <p className="text-lg text-gray-600">Loading borrow requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-grow p-6">
      <Card className="mb-8">
        <CardHeader className="bg-gray-200 rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-gray-700 text-center">Borrow Overview</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-200">
              <TableRow>
                <TableHead className="border border-gray-300 text-left">Borrow ID</TableHead>
                <TableHead className="border border-gray-300 text-left">Requested By</TableHead>
                <TableHead className="border border-gray-300 text-left">Date</TableHead>
                <TableHead className="border border-gray-300 text-left">Purpose</TableHead>
                <TableHead className="border border-gray-300 text-left">Status</TableHead>
                <TableHead className="border border-gray-300 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item, index) => (
                <TableRow
                  key={item.BorrowId}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition duration-200`}
                >
                  <TableCell className="border border-gray-300">{item.BorrowId}</TableCell>
                  <TableCell className="border border-gray-300">{item.RequestedBy}</TableCell>
                  <TableCell className="border border-gray-300">{item.ReqBorrowDate}</TableCell>
                  <TableCell className="border border-gray-300">{item.Purpose}</TableCell>
                  <TableCell className={`border border-gray-300 font-medium ${getStatusColor(item.Status)}`}>
                    {item.Status}
                  </TableCell>
                  <TableCell className="border border-gray-300 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => openViewModal(item)}
                        className="text-white bg-blue-700 hover:bg-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {item.Status === "Pending" && (
                        <Button
                          size="sm"
                          onClick={() => openCancelModal(item)}
                          className="text-white bg-red-600 hover:bg-red-700"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cancel Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-800 text-center">Confirm Cancellation</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to cancel this request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={closeCancelModal}
              className="text-gray-600 hover:text-gray-800 border-gray-300"
            >
              No, Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={cancelRequest}
              disabled={canceling}
              className="bg-red-600 hover:bg-red-700"
            >
              {canceling ? "Canceling..." : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      {currentItem && (
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-gray-700 text-center">Borrow Request Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <IdCard className="h-5 w-5 text-blue-500" />
                  <span>
                    <strong>ID:</strong> {currentItem.BorrowId}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-5 w-5 text-blue-500" />
                  <span>
                    <strong>Requested By:</strong> {currentItem.RequestedBy}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span>
                    <strong>Request Date:</strong> {currentItem.ReqBorrowDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span>
                    <strong>Purpose:</strong> {currentItem.Purpose}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Info className="h-5 w-5 text-blue-500" />
                  <span>
                    <strong>Status:</strong> {currentItem.Status}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div>
              <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" /> Borrowed Items
              </h4>

              {borrowLoading ? (
                <div className="text-center text-gray-500 text-lg py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Loading borrowed items...
                </div>
              ) : borrowedItems.length === 0 ? (
                <div className="text-center text-gray-500 text-lg py-8">No borrowed items found</div>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {borrowedItems.map((item) => (
                      <Card
                        key={item.ItemId}
                        className="border border-gray-200 bg-gray-50 hover:shadow-lg transition-shadow duration-300"
                      >
                        <CardContent className="p-4 flex items-center gap-6">
                          <img
                            src="https://via.placeholder.com/100"
                            alt={item.ItemName}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{item.ItemName}</h3>
                            <p className="text-sm text-gray-600">
                              Quantity: <strong>{item.Quantity}</strong>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

