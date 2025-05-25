"use client"
import dynamic from "next/dynamic"
import type React from "react"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"

import type { User, UserCreateDTO } from "@/types/user"
import { dashboardSideItems } from "@/lib/dashboard-items"
import RefreshIcon from "../../../public/images/refresh-cw-alt.svg"
 
import LoadingTable from "../LoadingTable"
import Pagination from "@/components/ui/Pagination"
import { useScrollLock } from "@/hooks/useScrollLock"
import UserTable from "./UserTable"
import Link from "next/link"

const UserFormModal = dynamic(() => import("./UserFormModal"), {
  loading: () => <div>Loading modal...</div>,
  ssr: false,
})

const createEmptyUserDto = (): UserCreateDTO => {
  return {
    username: "",
    password: "",
  }
}

export default function UserDashboard() {
  const [tableData, setTableData] = useState<User[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [emptyData, setEmptyData] = useState<UserCreateDTO>(createEmptyUserDto())

  useScrollLock(isCreateModalOpen)

  const rowOptions = dashboardSideItems.find((item) => item.id === "users")?.options || []

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  const fetchTableData = async (page = 1) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/users?page=${page}&limit=${itemsPerPage}`)
      if (response.ok) {
        const { result, totalItems } = await response.json()
console.log(totalItems,result,"deidine")
        setTotalPages(Math.ceil(totalItems / itemsPerPage))
        setTableData(result as User[])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error fetching user data")
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    fetchTableData()
  }, [])

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>, data: any) => {
    event.preventDefault()

    const toastId = toast.loading("Creating user...")
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users`, {
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

      toast.success("User created successfully")
      setIsCreateModalOpen(false)
      setEmptyData(createEmptyUserDto())
      handleRefresh()
    } catch (error) {
      console.error("Failed to create user:", error)
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
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center h-10 text-nowrap"
            // onClick={() => setIsCreateModalOpen(true)}
          >
         <Link href="/register">   Ajouter un administrateur   </Link>
          </button>
        )}
      </div>

      {/* Table */}
      {isLoadingData ? (
        <LoadingTable />
      ) : (
        <UserTable tableData={tableData} rowOptions={rowOptions} onRefresh={handleRefresh} />
      )}

      {/* Modal Add new user */}
      {isCreateModalOpen && (
        <UserFormModal
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
