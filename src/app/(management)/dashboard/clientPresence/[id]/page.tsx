
"use client"
import type React from "react"
import { useEffect, useState, useCallback } from "react"
import toast from "react-hot-toast"
 import { calculateAge } from "@/utils/helpers" 
import { AttendanceStatus } from "@/types/customer"
import DailyPatientAttendanceTable from "@/components/patientAttendance/DailyPatientAttendanceTable"

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const clientId = params.id ? Number.parseInt(params.id as string, 10) : null
 
  const [clientData, setClientData] = useState<any | null>(null)
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for Add Attendance Modal
  const [isAddAttendanceModalOpen, setIsAddAttendanceModalOpen] = useState(false)
  const [selectedDateForAdd, setSelectedDateForAdd] = useState(new Date().toISOString().split("T")[0])
  const [selectedStatusForAdd, setSelectedStatusForAdd] = useState<AttendanceStatus>(AttendanceStatus.PRESENT)
  const [poids, setPoids] = useState(0)
  const fetchClientAndAttendance = useCallback(async () => {
    if (!clientId) {
      setError("Patient information is missing.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Fetch client details
      const clientResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/${clientId}`)
      if (!clientResponse.ok) {
        const { error: clientError } = await clientResponse.json()
        throw new Error(clientError || "Unable to load patient information")
      }
      const client = await clientResponse.json()
      setClientData(client)

      // Fetch attendance records
      const attendanceResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/${clientId}/attendance`)
      if (!attendanceResponse.ok) {
        const { error: attendanceError } = await attendanceResponse.json()
        throw new Error(attendanceError || "Unable to load attendance records")
      }
      const attendance = await attendanceResponse.json()
      setAttendanceData(attendance)
    } catch (err: any) {
      console.error("Error fetching data:", err)
      setError(err.message || "Something went wrong. Please try again.")
      toast.error(err.message || "Failed to load patient information.")
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchClientAndAttendance()
  }, [fetchClientAndAttendance])

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) return

    const toastId = toast.loading("Saving attendance record...")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/${clientId}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendanceDate: selectedDateForAdd,
          status: selectedStatusForAdd,
          poids: poids,
        }),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      toast.success("Attendance record saved successfully!")
      setIsAddAttendanceModalOpen(false)
      setSelectedDateForAdd(new Date().toISOString().split("T")[0])
      setSelectedStatusForAdd(AttendanceStatus.PRESENT)
      fetchClientAndAttendance()
    } catch (error) {
      console.error("Failed to add attendance:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save attendance")
    } finally {
      toast.dismiss(toastId)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        )
      case "INACTIVE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Inactive
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {status}
          </span>
        )
    }
  }

 
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded-md w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded-md w-48 animate-pulse"></div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!clientData) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800"> notFound .</p>
            </div>
          </div>
        </div>
      </div>
    )
  }



  return (
  
  <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{clientData.nom}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-medium">id {clientData.codePatient}</span>
          {getStatusBadge(clientData.status)}
          
        </div>
      </div>
      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DailyPatientAttendanceTable
          clientData={clientData}
          attendanceData={attendanceData}
          onRefresh={fetchClientAndAttendance}
          isAddAttendanceModalOpen={isAddAttendanceModalOpen}
          setIsAddAttendanceModalOpen={setIsAddAttendanceModalOpen}
          selectedDateForAdd={selectedDateForAdd}
          setPoids={setPoids}
          poids={poids}
          setSelectedDateForAdd={setSelectedDateForAdd}
          selectedStatusForAdd={selectedStatusForAdd}
          setSelectedStatusForAdd={setSelectedStatusForAdd}
          handleAddAttendance={handleAddAttendance}
        />
      </div>
 
    </div>
  )
}