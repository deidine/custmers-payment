"use client"
import dynamic from "next/dynamic"
import type React from "react"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { Filter, X } from "lucide-react"

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

  // Filter states
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [membershipType, setMembershipType] = useState("")
  const [status, setStatus] = useState("")
  const [unpaidThisMonth, setUnpaidThisMonth] = useState(false)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useScrollLock(isCreateModalOpen)

  const rowOptions = dashboardSideItems.find((item) => item.id === "customers")?.options || []

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  // Get current month for display
  const currentDate = new Date()
  const formattedMonth = currentDate.toLocaleDateString('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  })

  const buildQueryParams = (page = 1) => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', itemsPerPage.toString())
    
    if (membershipType) params.set('membershipType', membershipType)
    if (status) params.set('status', status)
    if (unpaidThisMonth) params.set('unpaidThisMonth', 'true')
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    
    return params.toString()
  }

  const fetchTableData = async (page = 1) => {
    try {
      setIsLoadingData(true)
      const queryString = buildQueryParams(page)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/customers?${queryString}`,
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
    setCurrentPage(1)
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
    setMembershipType("")
    setStatus("")
    setUnpaidThisMonth(false)
    setDateFrom("")
    setDateTo("")
    setCurrentPage(1)
    fetchTableData(1)
  }

  const handleFilterUnpaidThisMonth = () => {
    setUnpaidThisMonth(true)
    setCurrentPage(1)
    fetchTableData(1)
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
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center h-10 text-nowrap"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Ajouter un client
          </button>
        )}
      </div>

      {/* Filter Section */}
      <div className="mb-4">
        <button 
          className="flex items-center gap-2 mb-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <Filter className="w-4 h-4" />
          {isFilterExpanded ? "Masquer les filtres" : "Afficher les filtres"}
        </button>
        
        {isFilterExpanded && (
          <div className="p-4 bg-white border rounded-md shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Filter by membership type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'adhésion</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={membershipType}
                  onChange={(e) => setMembershipType(e.target.value)}
                >
                  <option value="">Tous les types</option>
                  <option value="BASIC">Basic</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              
              {/* Filter by status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut du client</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="ACTIVE">Actif</option>
                  <option value="INACTIVE">Inactif</option>
                  <option value="SUSPENDED">Suspendu</option>
                </select>
              </div>
              
              {/* Date from */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input 
                  type="date" 
                  className="w-full p-2 border rounded-md"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              
              {/* Date to */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <input 
                  type="date" 
                  className="w-full p-2 border rounded-md"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              
              {/* Unpaid this month checkbox */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Non payé ce mois ({formattedMonth})
                </label>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={unpaidThisMonth}
                    onChange={(e) => setUnpaidThisMonth(e.target.checked)}
                  />
                  <span className="text-sm text-gray-600">Clients n'ayant pas payé ce mois</span>
                </div>
              </div>
            </div>
            
            {/* Filter actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleApplyFilters}
              >
                Appliquer les filtres
              </button>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center gap-1"
                onClick={handleClearFilters}
              >
                <X className="w-4 h-4" /> Réinitialiser les filtres
              </button>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={handleFilterUnpaidThisMonth}
              >
                Non payés ce mois
              </button>
            </div>
          </div>
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