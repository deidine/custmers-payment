"use client"
import dynamic from "next/dynamic"
import type React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"

import type { PaymentWithCustomer } from "@/types/payment"
import { dashboardSideItems } from "@/lib/dashboard-items"
import RefreshIcon from "../../../public/images/refresh-cw-alt.svg"
import { Filter, X } from 'lucide-react'
 
import LoadingTable from "../LoadingTable"
import Pagination from "@/components/ui/Pagination"
import { useScrollLock } from "@/hooks/useScrollLock"
import PaymentTable from "./PaymentTable"
 
const PaymentFormModal = dynamic(() => import("./PaymentFormModal"), {
  loading: () => <div>Loading modal...</div>,
  ssr: false,
})

export default function PaymentDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [tableData, setTableData] = useState<PaymentWithCustomer[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
   // Initialize filter states from URL parameters
  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "")
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "")
  const [amountMin, setAmountMin] = useState(searchParams.get("amountMin") || "")
  const [amountMax, setAmountMax] = useState(searchParams.get("amountMax") || "")
  const [customerId, setCustomerId] = useState(searchParams.get("customerId") || "")
  const [unpaidInMonth, setUnpaidInMonth] = useState(searchParams.get("unpaidInMonth") || "")

  useScrollLock(isCreateModalOpen)

  const rowOptions = dashboardSideItems.find((item) => item.id === "payments")?.options || []

  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"))
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  const buildQueryParams = (page = 1) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: itemsPerPage.toString(),
    })

    if (status) params.append("status", status)
    if (dateFrom) params.append("dateFrom", dateFrom)
    if (dateTo) params.append("dateTo", dateTo)
    if (amountMin !== "") params.append("amountMin", amountMin)
    if (amountMax !== "") params.append("amountMax", amountMax)
    if (customerId) params.append("customerId", customerId)
    if (unpaidInMonth) params.append("unpaidInMonth", unpaidInMonth)

    return params.toString()
  }

  // Update URL with current filter state
  const updateURL = (page = currentPage) => {
    const params = new URLSearchParams()
    
    if (page > 1) params.set("page", page.toString())
    if (status) params.set("status", status)
    if (dateFrom) params.set("dateFrom", dateFrom)
    if (dateTo) params.set("dateTo", dateTo)
    if (amountMin !== "") params.set("amountMin", amountMin)
    if (amountMax !== "") params.set("amountMax", amountMax)
    if (customerId) params.set("customerId", customerId)
    if (unpaidInMonth) params.set("unpaidInMonth", unpaidInMonth)

    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : window.location.pathname
    
    // Update URL without triggering a page reload
    router.replace(newUrl, { scroll: false })
  }

  const fetchTableData = async (page = 1) => {
    setIsLoadingData(true)
    const queryParams = buildQueryParams(page)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments?${queryParams}`,
      )

      if (response.ok) {
        const { data, totalItems } = await response.json()
        setTotalPages(Math.ceil(totalItems / itemsPerPage))
        setTableData(data as PaymentWithCustomer[])
      } else {
        throw new Error("Failed to fetch payments.")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error fetching payment data")
    } finally {
      setIsLoadingData(false)
    }
  }

  // Update URL whenever filter states change
  useEffect(() => {
    updateURL(currentPage)
    fetchTableData(currentPage)
  }, [status, dateFrom, dateTo, amountMin, amountMax, customerId, unpaidInMonth])

  // Update URL when page changes
  useEffect(() => {
    updateURL(currentPage)
  }, [currentPage])

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

  const handleApplyFilters = () => {
    setCurrentPage(1)
    fetchTableData(1)
  }

  const handleClearFilters = () => {
    setStatus("")
    setDateFrom("")
    setDateTo("")
    setAmountMin("")
    setAmountMax("")
    setCustomerId("")
    setUnpaidInMonth("")
    setCurrentPage(1)
    fetchTableData(1)
  }

  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  }

  const handleFilterUnpaidThisMonth = () => {
    setUnpaidInMonth(getCurrentMonth())
    setCurrentPage(1)
    fetchTableData(1)
  }

  return (
    <>
      {/* Filter Section */}
      <div className="mb-4">
        <button 
          className="flex items-center gap-2 mb-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <Filter className="w-4 h-4" />
          {isFilterExpanded ? "Hide Filters" : "Show Filters"}
        </button>
        
        {isFilterExpanded && (
          <div className="p-4 bg-white border rounded-md shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              
              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input 
                  type="date" 
                  className="w-full p-2 border rounded-md"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              
              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input 
                  type="date" 
                  className="w-full p-2 border rounded-md"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              
              {/* Amount Min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount ($)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-md"
                  placeholder="0.00"
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value)}
                />
              </div>
              
              {/* Amount Max */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount ($)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-md"
                  placeholder="1000.00"
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value)}
                />
              </div>
              
              {/* Customer ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter customer ID"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
              </div>
              
              {/* Unpaid in Month */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unpaid in Month</label>
                <input 
                  type="month" 
                  className="w-full p-2 border rounded-md"
                  value={unpaidInMonth}
                  onChange={(e) => setUnpaidInMonth(e.target.value)}
                />
              </div>
            </div>
            
            {/* Filter Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </button>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center gap-1"
                onClick={handleClearFilters}
              >
                <X className="w-4 h-4" /> Clear Filters
              </button>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => {
                  setStatus("PENDING")
                  handleApplyFilters()
                }}
              >
                Pending Payments
              </button>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={handleFilterUnpaidThisMonth}
              >
                Unpaid This Month
              </button>
            </div>
          </div>
        )}
      </div>

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
{role}
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