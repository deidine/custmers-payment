"use client"
import dynamic from "next/dynamic"
import type React from "react"
import { useState } from "react"
import toast from "react-hot-toast"
import { CreditCard, ClipboardList } from "lucide-react"

import type { Customer } from "@/types/customer"
import { useScrollLock } from "@/hooks/useScrollLock"
import DeleteModal from "../DeleteModal"

 

interface CustomerTableProps {
  tableData: Customer[]
  rowOptions?: string[]
  onRefresh: () => void
}

export default function NoPayedCustomerTable({ tableData, rowOptions = [], onRefresh }: CustomerTableProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

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

    const identifier = modalData["customerId"]
    const toastId = toast.loading("Updating member...")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/${identifier}`, {
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

      toast.success("Member updated successfully")
      closeModals()
      onRefresh()
    } catch (error) {
      console.error("Failed to update member:", error)
      toast.error(error instanceof Error ? error.message : "Update failed")
    } finally {
      toast.dismiss(toastId)
    }
  }

  const handleDeleteConfirm = async () => {
    const identifier = modalData["customerId"]
    const toastId = toast.loading("Deleting member...")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/${identifier}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      toast.success("Member deleted successfully")
      closeModals()
      onRefresh()
    } catch (error) {
      console.error("Failed to delete member:", error)
      toast.error(error instanceof Error ? error.message : "Delete failed")
    } finally {
      toast.dismiss(toastId)
    }
  }

  // Early return if tableData is empty
  if (!tableData || tableData.length === 0) {
    return <p className="text-center text-lg mt-10">No members available</p>
  }

  // Format dates and membership status
  const formatCellValue = (key: string, value: any) => {
    if (value === undefined || value === null) return "-"

    if (key === "dateOfBirth" || key === "membershipStartDate" || key === "membershipEndDate") {
      return value ? new Date(value).toLocaleDateString() : "-"
    }

    if (key === "status") {
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : value === "INACTIVE"
                ? "bg-gray-100 text-gray-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      )
    }

    if (key === "membershipType") {
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "BASIC"
              ? "bg-gray-100 text-gray-800"
              : value === "STANDARD"
                ? "bg-blue-100 text-blue-800"
                : value === "PREMIUM"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-yellow-100 text-yellow-800"
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
            ID Membre
          </th>
          <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
            Nom
          </th>
          <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
            Contact
          </th>
          
          <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
            Statut
          </th>
          <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[180px]">
            Options
          </th>
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-gray-200">
        {tableData.map((row, index) => (
          <tr
            key={index}
            onClick={() => setIsSelectedRow(index)}
            className={isSelectedRow === index ? "bg-green-50" : ""}
          >
            <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {row.customerId}
            </td>
            <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {row.firstName} {row.lastName}
            </td>
            <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div>{row.phoneNumber || "-"}</div>
              <div className="text-xs">{row.email || "-"}</div>
            </td>
          
            <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm">
              {formatCellValue("status", row.status)}
            </td>
            <td className="border border-slate-300 px-6 py-4">
              <div className="flex items-center justify-center gap-2">
 
                {rowOptions.includes("VIEW") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `/dashboard/clientPresence/${row.customerId}`
                    }}
                    className="text-white bg-purple-600 hover:bg-purple-700 font-medium rounded-lg text-sm px-2 py-1 text-center hover:underline flex items-center"
                  >
                    <ClipboardList className="w-3.5 h-3.5 mr-1" /> Visites
                  </button>
                )}
 
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
 
  </div>
)

}
