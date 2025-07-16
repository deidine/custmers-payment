"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useParams } from "next/navigation"
import { format } from "date-fns"
import toast from "react-hot-toast"

import type { User,  } from "@/types/user"
import LoadingTable from "@/components/dashboard/LoadingTable"
import AttendanceTable from "@/components/dashboard/attendance/AttendanceTable"
  
 export default function UserAttendancePage({ userId }: { userId: string }) {
 
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<User | null>(null)
  const [attendanceData, setAttendanceData] = useState<any[]>([])
   const [activeTab, setActiveTab] = useState<"daily" | "summary">("daily")

  // Get the first and last day of the current month
  const today = new Date()
  const startOfMonth = format(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-dd")
  const endOfMonth = format(new Date(today.getFullYear(), today.getMonth() + 1, 0), "yyyy-MM-dd")

  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth,
    endDate: endOfMonth,
  })

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/users/${userId}`)

      const data = await response.json()
      console.log(data)
      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }
      setUserData(data)
    } catch (error) {
      console.error("Error fetching user:", error)
      toast.error("Error fetching user data")
    }
  }

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/users/${userId}/attendance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data")
      }

      const data = await response.json()
      setAttendanceData(data.result)
    } catch (error) {
      console.error("Error fetching attendance:", error)
      toast.error("Error fetching attendance data")
    }
  }

  // Fetch attendance summary data
 

  // Fetch all data
  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchUserData(), fetchAttendanceData() ])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [userId])

  // Refresh attendance data when date range changes
  useEffect(() => {
    if (userData) {
      fetchAttendanceData()
    }
  }, [dateRange, userId])

  // Handle date range changes
  const handleDateRangeChange = (e: React.FormEvent) => {
    e.preventDefault()
    // Date range is already set in state by the individual input changes
    fetchAttendanceData()
  }

  if (isLoading) {
    return <LoadingTable />
  }

  if (!userData) {
    return <div className="text-center p-8">User not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            className={`pb-2 px-1 ${
              activeTab === "daily"
                ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("daily")}
          >
            Daily Attendance
          </button>
          <button
            className={`pb-2 px-1 ${
              activeTab === "summary"
                ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("summary")}
          >
            Attendance Summary
          </button>
        </div>
      </div>

      {activeTab === "daily" && (
        <>
          {/* Date Range Filter */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <form onSubmit={handleDateRangeChange} className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="border rounded px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="border rounded px-3 py-1.5"
                />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700">
                Apply Filter
              </button>
            </form>
          </div>

          {/* Attendance Table */}
          <AttendanceTable userData={userData} attendanceData={attendanceData} onRefresh={fetchAllData} />
        </>
      )}

     </div>
  )
}
