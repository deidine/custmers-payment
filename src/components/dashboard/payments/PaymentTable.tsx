"use client"
import dynamic from "next/dynamic"
import type React from "react"
import { useState } from "react"
import toast from "react-hot-toast"

import type { PaymentWithCustomer } from "@/types/payment"
import { useScrollLock } from "@/hooks/useScrollLock"
import DeleteModal from "../DeleteModal"
import { useUser } from "@/contexts/UserContext"

const PaymentFormModal = dynamic(() => import("./PaymentFormModal"), {
  loading: () => <p>Loading modal...</p>,
  ssr: false,
})

interface PaymentTableProps {
  tableData: PaymentWithCustomer[]
  rowOptions?: string[]
  onRefresh: () => void
}

export default function PaymentTable({ tableData, rowOptions = [], onRefresh }: PaymentTableProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const { user } = useUser();

  // Lock scroll when any modal is open
  useScrollLock(isUpdateModalOpen || isDeleteModalOpen)

  const [modalData, setModalData] = useState<any>(null)
  const [isSelectedRow, setIsSelectedRow] = useState<any>(null)

  const openUpdateModal = (rowData: any) => {
    setModalData(rowData) // store the row data
    setIsUpdateModalOpen(true)
  }

  const openDeleteModal = (rowData: any) => {
    setModalData(rowData) // store the row data
    setIsDeleteModalOpen(true)
  }

  const closeModals = () => {
    setIsUpdateModalOpen(false)
    setIsDeleteModalOpen(false)
    setModalData(null)
  }

  const handleUpdateSubmit = async (event: React.FormEvent<HTMLFormElement>, data: any) => {
    event.preventDefault()

    const identifier = modalData["paymentId"]
    const toastId = toast.loading("Updating payment...")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/payments/${identifier}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      toast.success("Payment updated successfully")
      closeModals()
      onRefresh()
    } catch (error) {
      console.error("Failed to update payment:", error)
      toast.error(error instanceof Error ? error.message : "Update failed")
    } finally {
      toast.dismiss(toastId)
    }
  }

  const handleDeleteConfirm = async () => {
    const identifier = modalData["paymentId"]
    const toastId = toast.loading("Deleting payment...")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/payments/${identifier}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      toast.success("Payment deleted successfully")
      closeModals()
      onRefresh()
    } catch (error) {
      console.error("Failed to delete payment:", error)
      toast.error(error instanceof Error ? error.message : "Delete failed")
    } finally {
      toast.dismiss(toastId)
    }
  }

  // Early return if tableData is empty
  if (!tableData || tableData.length === 0) {
    return <p className="text-center text-lg mt-10">No payments available</p>
  }

  // Format payment details
  const formatCellValue = (key: string, value: any) => {
    if (value === undefined || value === null) return "-"

    if (key === "paymentDate") {
      return new Date(value).toLocaleDateString()
    }

    if (key === "amount") {
      return `$${Number(value).toFixed(2)}`
    }

    if (key === "status") {
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "COMPLETED"
              ? "bg-green-100 text-green-800"
              : value === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : value === "FAILED"
                  ? "bg-red-100 text-red-800"
                  : "bg-purple-100 text-purple-800"
          }`}
        >
          {value}
        </span>
      )
    }

    return value
  }

  return (
    <div className="relative overflow-x-auto max-w-full">
      <table className="min-w-full bg-white border-collapse border border-slate-400">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Payment ID
            </th>
            <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Method
            </th>
            <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[120px]">
              Options
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {tableData.map((row, index) => (
            <tr
              key={index}
              onClick={() => setIsSelectedRow(index)}
              className={isSelectedRow === index ? "bg-blue-50" : ""}
            >
              <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {row.paymentId}
              </td>
              <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {row.customerName || `Customer #${row.customerId}`}
              </td>
              <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {formatCellValue("paymentDate", row.paymentDate)}
              </td>
              <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatCellValue("amount", row.amount)}
              </td>
              <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {row.paymentMethod}
              </td>
              <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {row.paymentType}
              </td>
              <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm">
                {formatCellValue("status", row.status)}
              </td>
              <td className="border border-slate-300 px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  {/* Update button */}
                  {rowOptions.includes("UPDATE") && (user?.role === "ADMIN" || user?.role === "MANAGER") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openUpdateModal(row)
                      }}
                      className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-3 py-1 text-center hover:underline"
                    >
                      Edit
                    </button>
                  )}

                  {/* Delete button */}
                  {rowOptions.includes("DELETE")&& (user?.role === "ADMIN" || user?.role === "MANAGER")  && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openDeleteModal(row)
                      }}
                      className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-1 text-center hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && modalData && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeModals}
          onConfirm={handleDeleteConfirm}
          title="Delete Payment"
          message={`Are you sure you want to delete payment #${modalData.paymentId}? This action cannot be undone.`}
        />
      )}

      {/* Update payment modal */}
      {isUpdateModalOpen && modalData && (
        <PaymentFormModal
          mode={"update"}
          isOpen={isUpdateModalOpen}
          onClose={closeModals}
          onSubmit={handleUpdateSubmit}
          customerId={modalData.customerId}
          data={modalData}
        />
      )}
    </div>
  )
}
