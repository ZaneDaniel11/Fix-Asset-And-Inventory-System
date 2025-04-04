"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import { ShoppingCart, X, Plus, Minus, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

const RequestSummary = ({ selectedProducts, onQuantityChange, onRemoveProduct, onRequestCompleted }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [purpose, setPurpose] = useState("")
  const [priority, setPriority] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openModal = () => setModalIsOpen(true)
  const closeModal = () => setModalIsOpen(false)

  const handleSave = async () => {
    if (!purpose.trim()) {
      toast.error("Purpose is required")
      return
    }

    setIsSubmitting(true)
    const loggedInUsername = localStorage.getItem("name")
    const borrowerId = localStorage.getItem("userId")
    const email = localStorage.getItem("email")

    if (!borrowerId) {
      toast.error("User is not logged in. Please log in again.")
      setIsSubmitting(false)
      return
    }

    const requestPayload = {
      requestedBy: loggedInUsername || "Unknown",
      borrowerId: Number.parseInt(borrowerId),
      purpose,
      status: "Pending",
      priority,
      email: email,
      items: selectedProducts.map((product) => ({
        itemName: product.itemName,
        quantity: product.requestedQuantity,
        itemID: product.itemID,
        categoryID: product.categoryID,
      })),
    }

    try {
      const response = await fetch("http://localhost:5075/api/BorrowRequestApi/Request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      })

      if (response.ok) {
        onRequestCompleted()
        toast.success("Borrow request submitted successfully!")
        setPurpose("")
        setPriority("")
        closeModal()
      } else {
        const errorData = await response.json().catch(() => null)
        toast.error(errorData?.message || "Error submitting request")
      }
    } catch (error) {
      toast.error("Network error. Please try again.")
      console.error("Error submitting request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIncrease = (itemID, availableQuantity) => {
    const product = selectedProducts.find((p) => p.itemID === itemID)
    if (product.requestedQuantity < availableQuantity) {
      onQuantityChange(itemID, product.requestedQuantity + 1)
    } else {
      toast.info("Maximum available quantity reached")
    }
  }

  const handleDecrease = (itemID) => {
    const product = selectedProducts.find((p) => p.itemID === itemID)
    if (product.requestedQuantity > 1) {
      onQuantityChange(itemID, product.requestedQuantity - 1)
    }
  }

  const totalItems = selectedProducts.reduce((total, product) => total + product.requestedQuantity, 0)

  return (
    <div className="w-full lg:w-4/12 lg:ml-6 mt-6 lg:mt-0">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
          <h2 className="text-2xl font-bold">Your Cart</h2>
          <Badge variant="outline" className="flex items-center gap-1 bg-white/20 text-white border-white/30">
            <ShoppingCart className="h-4 w-4" />
            <span>{totalItems} items</span>
          </Badge>
        </CardHeader>

        <CardContent className="pt-4">
          {selectedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted rounded-lg">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">Your cart is empty</h3>
              <p className="text-muted-foreground max-w-xs">
                Start by selecting items you'd like to borrow from the list.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6 scrollbar-thin">
              <AnimatePresence>
                {selectedProducts.map((product) => (
                  <motion.div
                    key={product.itemID}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-foreground pr-6 line-clamp-1">{product.itemName}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => onRemoveProduct(product.itemID)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className={`h-8 w-8 ${
                                product.requestedQuantity <= 1
                                  ? "bg-gray-100 text-gray-400"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300"
                              }`}
                              onClick={() => handleDecrease(product.itemID)}
                              disabled={product.requestedQuantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                              <span className="sr-only">Decrease quantity</span>
                            </Button>
                            <span className="font-medium text-foreground w-6 text-center">
                              {product.requestedQuantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className={`h-8 w-8 ${
                                product.requestedQuantity >= product.initialQuantity
                                  ? "bg-gray-100 text-gray-400"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300"
                              }`}
                              onClick={() => handleIncrease(product.itemID, product.initialQuantity)}
                              disabled={product.requestedQuantity >= product.initialQuantity}
                            >
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Increase quantity</span>
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Max: <span className="font-medium">{product.initialQuantity}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            size="lg"
            onClick={openModal}
            disabled={selectedProducts.length === 0}
          >
            Submit Borrow Request
          </Button>
        </CardFooter>
      </Card>

      {/* Request Dialog */}
      <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-lg -mt-6 -mx-6 mb-6">
            <DialogTitle className="text-2xl">Submit Borrow Request</DialogTitle>
            <DialogDescription className="text-indigo-100">Please provide details for your request</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="warning" className="text-amber-600 bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You are requesting to borrow {totalItems} item{totalItems !== 1 ? "s" : ""}. Please provide a clear
                purpose for your request.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="purpose" className="text-right">
                Purpose <span className="text-destructive">*</span>
              </Label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Why do you need these items?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RequestSummary

