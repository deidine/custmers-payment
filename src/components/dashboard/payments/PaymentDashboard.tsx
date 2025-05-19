"use client"
import dynamic from "next/dynamic"
import type React from "react"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"

import type { PaymentWithCustomer } from "@/types/payment"
import { dashboardSideItems } from "@/lib/dashboard-items"
import RefreshIcon from "../../../public/images/refresh-cw-alt.svg"
 
import LoadingTable from "../LoadingTable"
import Pagination from "@/components/ui/Pagination"
import { useScrollLock } from "@/hooks/useScrollLock"
import PaymentTable from "./PaymentTable"

const PaymentFormModal = dynamic(() => import("./PaymentFormModal"), {
  loading: () => <div>Loading modal...</div>,
  ssr: false,
})

export default function PaymentDashboard() {
  const [tableData, setTableData] = useState<PaymentWithCustomer[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useScrollLock(isCreateModalOpen)

  const rowOptions = dashboardSideItems.find((item) => item.id === "payments")?.options || []

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  const fetchTableData = async (page = 1) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments?page=${page}&limit=${itemsPerPage}`,
      ) 
 
      if (response.ok) {
        const { data, totalItems } = await response.json()
         console.log(totalItems,"deidine")
        setTotalPages(Math.ceil(totalItems / itemsPerPage))
        setTableData(data as PaymentWithCustomer[])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error fetching payment data")
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    fetchTableData()
  }, [])

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>, data: any) => {
    event.preventDefault()

    const toastId = toast.loading("Creating payment...")
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      toast.success("Payment created successfully")
      setIsCreateModalOpen(false)
      handleRefresh()
    } catch (error) {
      console.error("Failed to create payment:", error)
      toast.error(error instanceof Error ? error.message : "Create failed")
    } finally {
      toast.dismiss(toastId)
    }
  }

  const handleRefresh = () => {
    setIsLoadingData(true)
    setCurrentPage(1) // Reset to the first page
    fetchTableData(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchTableData(page)
  }

  return (
    <>
      {/* Dashboard Options */}
      <div className="flex justify-start items-start gap-2 mb-2">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center w-12 h-10"
          onClick={handleRefresh}
        >
          <RefreshIcon className="w-5 h-5" fill="none" stroke="white" />
        </button>

        {rowOptions.includes("CREATE") && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center w-32 h-10 text-nowrap"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add payment
          </button>
        )}
      </div>

      {/* Table */}
      {isLoadingData ? (
        <LoadingTable />
      ) : (
        <PaymentTable tableData={tableData} rowOptions={rowOptions} onRefresh={handleRefresh} />
      )}

      {/* Modal Add new payment */}
      {isCreateModalOpen && (
        <PaymentFormModal
          mode={"create"}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </>
  )
}
