"use client"
import dynamic from "next/dynamic"
import type React from "react"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"

import type { Customer, CustomerCreateDTO } from "@/types/customer"
import { dashboardSideItems } from "@/lib/dashboard-items"
import RefreshIcon from "../../../public/images/refresh-cw-alt.svg"
import CustomerTable from "./CustomerTable"
import LoadingTable from "../LoadingTable"
import Pagination from "@/components/ui/Pagination"
import { useScrollLock } from "@/hooks/useScrollLock"

const CustomerFormModal = dynamic(() => import("./CustomerFormModal"), {
  loading: () => <div>Loading modal...</div>,
  ssr: false,
})

const createEmptyCustomerDto = (): CustomerCreateDTO => {
  return {
    firstName: "",
    lastName: "",
    membershipType: "BASIC",
    status: "ACTIVE",
  }
}

export default function CustomerDashboard() {
  const [tableData, setTableData] = useState<Customer[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [emptyData, setEmptyData] = useState<CustomerCreateDTO>(createEmptyCustomerDto())

  useScrollLock(isCreateModalOpen)

  const rowOptions = dashboardSideItems.find((item) => item.id === "customers")?.options || []

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  const fetchTableData = async (page = 1) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/customers?page=${page}&limit=${itemsPerPage}`,
      )
      if (response.ok) {
        const { result, totalItems } = await response.json()

        setTotalPages(Math.ceil(totalItems / itemsPerPage))
        setTableData(result as Customer[])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error fetching customer data")
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    fetchTableData()
  }, [])

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>, data: any) => {
    event.preventDefault()

    const toastId = toast.loading("Creating customer...")
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customers`, {
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

      toast.success("Customer created successfully")
      setIsCreateModalOpen(false)
      setEmptyData(createEmptyCustomerDto())
      handleRefresh()
    } catch (error) {
      console.error("Failed to create customer:", error)
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
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center w-12 h-10"
          onClick={handleRefresh}
        >
          <RefreshIcon className="w-5 h-5" fill="none" stroke="white" />
        </button>

        {rowOptions.includes("CREATE") && (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center w-36 h-10 text-nowrap"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add new member
          </button>
        )}
      </div>

      {/* Table */}
      {isLoadingData ? (
        <LoadingTable />
      ) : (
        <CustomerTable tableData={tableData} rowOptions={rowOptions} onRefresh={handleRefresh} />
      )}

      {/* Modal Add new customer */}
      {isCreateModalOpen && (
        <CustomerFormModal
          mode={"create"}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
          data={emptyData}
        />
      )}

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </>
  )
}
