"use client"
import { useState, useEffect } from "react"
import type React from "react"
import toast from "react-hot-toast"

import type { Payment, PaymentCreateDTO, PaymentUpdateDTO } from "@/types/payment"
import { PaymentMethod, PaymentType, PaymentStatus } from "@/types/payment"
import type { Customer } from "@/types/customer"

interface PaymentFormModalProps {
  mode: "create" | "update"
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>, data: any) => void
  data?: Payment | PaymentCreateDTO | PaymentUpdateDTO
  customerId?: number // Optional prop to pre-select customer
}

export default function PaymentFormModal({ mode, isOpen, onClose, onSubmit, data, customerId }: PaymentFormModalProps) {
  const [formData, setFormData] = useState<any>({
    customerId: customerId || "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: PaymentMethod.CASH,
    paymentType: PaymentType.MEMBERSHIP,
    status: PaymentStatus.COMPLETED,
    notes: "",
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)

  // Filter out paymentId, createdAt, updatedAt from data
  useEffect(() => {
    if (data) {
      if ("paymentId" in data) {
        const { paymentId, createdAt, updatedAt, ...rest } = data as Payment
        setFormData(rest)
      } else {
        setFormData(data)
      }
    }
  }, [data])

  // Fetch customers for dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customers?limit=100`)
        if (response.ok) {
          const { result } = await response.json()
          setCustomers(result)
        }
      } catch (error) {
        console.error("Error fetching customers:", error)
        toast.error("Could not load customers list")
      } finally {
        setIsLoadingCustomers(false)
      }
    }

    fetchCustomers()
  }, [])

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Convert string amount to number
    const submissionData = {
      ...formData,
      amount: Number.parseFloat(formData.amount),
      // Add current user ID as createdBy if creating new payment
      ...(mode === "create" && { createdBy: 1 }), // Replace with actual logged in user ID
    }

    onSubmit(event, submissionData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full mx-4 md:mx-auto my-auto overflow-y-auto max-h-[90vh]">
        <div className="relative">
          <h2 className="text-xl font-bold mb-4">{mode === "create" ? "Add New Payment" : "Update Payment"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 right-2 p-2 bg-gray-200 rounded-md hover:bg-gray-400 focus:outline-none"
          >
            X
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer field */}
{        mode !="update" &&   <div className="col-span-2 mb-3">
            <label className="block text-gray-700 text-sm font-bold mb-1">Customer</label>
            <select
              value={formData?.customerId || ""}
              onChange={(e) => handleInputChange("customerId", Number.parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              required
              disabled={isLoadingCustomers || !!customerId}
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.firstName} {customer.lastName}
                </option>
              ))}
            </select>
          </div>}

          {/* Payment Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">Payment Information</h3>
          </div>

          {/* Amount field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData?.amount || ""}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          {/* Payment Date field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Payment Date</label>
            <input
              type="date"
              value={formData?.paymentDate ? new Date(formData.paymentDate).toISOString().split("T")[0] : ""}
              onChange={(e) => handleInputChange("paymentDate", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          {/* Payment Method field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Payment Method</label>
            <select
              value={formData?.paymentMethod || PaymentMethod.CASH}
              onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              required
            >
              <option value={PaymentMethod.CASH}>Cash</option>
              <option value={PaymentMethod.CREDIT_CARD}>Credit Card</option>
              <option value={PaymentMethod.DEBIT_CARD}>Debit Card</option>
              <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
              <option value={PaymentMethod.ONLINE}>Online</option>
            </select>
          </div>

          {/* Payment Type field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Payment Type</label>
            <select
              value={formData?.paymentType || PaymentType.MEMBERSHIP}
              onChange={(e) => handleInputChange("paymentType", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              required
            >
              <option value={PaymentType.MEMBERSHIP}>Membership</option>
              <option value={PaymentType.PERSONAL_TRAINING}>Personal Training</option>
              <option value={PaymentType.SUPPLEMENTS}>Supplements</option>
              <option value={PaymentType.OTHER}>Other</option>
            </select>
          </div>

          {/* Payment Status field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Payment Status</label>
            <select
              value={formData?.status || PaymentStatus.COMPLETED}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              required
            >
              <option value={PaymentStatus.COMPLETED}>Completed</option>
              <option value={PaymentStatus.PENDING}>Pending</option>
              <option value={PaymentStatus.FAILED}>Failed</option>
              <option value={PaymentStatus.REFUNDED}>Refunded</option>
            </select>
          </div>

          {/* Invoice Number field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Invoice Number</label>
            <input
              type="text"
              value={formData?.invoiceNumber || ""}
              onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* Receipt Number field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Receipt Number</label>
            <input
              type="text"
              value={formData?.receiptNumber || ""}
              onChange={(e) => handleInputChange("receiptNumber", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* Transaction Reference field */}
          <div className="col-span-2 mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Transaction Reference</label>
            <input
              type="text"
              value={formData?.transactionReference || ""}
              onChange={(e) => handleInputChange("transactionReference", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* Notes field */}
          <div className="col-span-2 mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Notes</label>
            <textarea
              value={formData?.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              rows={2}
            />
          </div>

          <div className="col-span-2 flex justify-end mt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mr-2">
              {mode === "create" ? "Create" : "Save"}
            </button>
            <button type="button" onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
