
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

  // A helper function to render a single info item
  const InfoItem = ({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: React.ElementType }) => (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </div>
      <p className="text-gray-900">{value}</p>
    </div>
  );

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
          setSelectedDateForAdd={setSelectedDateForAdd}
          selectedStatusForAdd={selectedStatusForAdd}
          setSelectedStatusForAdd={setSelectedStatusForAdd}
          handleAddAttendance={handleAddAttendance}
        />
      </div>
      {/* Patient Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
 information        </h3>
          <img
          src={clientData.profilePictureUrl || "/placeholder.svg"}
          alt="Profile Preview"
          className="w-40 h-40 object-cover"
        />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Existing Info Items */}
            <InfoItem label={"nni"} value={clientData.nni} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m4-2v2"/></svg>} />
            <InfoItem label={"telephone"}  value={clientData.telephone} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>} />
            <InfoItem label={"dateNais"}  value={new Date(clientData.dateNais).toLocaleDateString() + `(${calculateAge(clientData.dateNais)} years old)`} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 11-4 0 2 2 0 014 0zM8 11a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z"/></svg>} />
            <InfoItem label={"adresse"} value={`${clientData.adresse}, ${clientData.wilaya}`} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} />
            <InfoItem label={"numSeance"}  value={new Date(clientData.dateAdmission).toLocaleDateString()} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
            <InfoItem label={"dateAdmission"}  value={clientData.nbSeance} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>} />
 
            {/* New Info Items */}
            <InfoItem label="UUID" value={clientData.uuid} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5.5c.616 0 1.18.252 1.637.755l2.766 2.766c.503.457.755 1.02.755 1.637V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>} />
            <InfoItem label={"insurance"}  value={clientData.assurance} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.007 12.007 0 002.944 12c.007 3.93 1.56 7.618 4.244 10.324a1 1 0 001.414 0C10.43 21.118 12 17.43 12 12c0-3.93-1.56-7.618-4.244-10.324z"/></svg>} />
            <InfoItem label={"insuranceCode"} value={clientData.codeAssurance} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>} />
            <InfoItem label={"laboratory"}  value={clientData.laboratoire} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.316-.684a1 1 0 00-.816.4l-1.97 2.302A1.49 1.49 0 0110 17H7a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v10a2 2 0 01-2 2z"/></svg>} />
            <InfoItem label={"laboratoryCode"}  value={clientData.codeLabo} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>} />
            <InfoItem label={"series"}  value={clientData.series} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>} />
            <InfoItem label={"sessionNumber"} value={clientData.numSeance} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10m-9 4h8a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>} />
            <InfoItem label={"serology"} value={clientData.serelogie} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.007 12.007 0 002.944 12c.007 3.93 1.56 7.618 4.244 10.324a1 1 0 001.414 0C10.43 21.118 12 17.43 12 12c0-3.93-1.56-7.618-4.244-10.324z"/></svg>} />
            <InfoItem label={"mode"} value={clientData.mode} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>} />
            <InfoItem label={"referral"} value={clientData.deLaPartDe} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 17H5a2 2 0 00-2 2v2h14v-2a2 2 0 00-2-2z"/></svg>} />
            <InfoItem label={"enabled"} value={clientData.isEnabled ? "Yes" : "No"} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
            <InfoItem label={"createdAt"}  value={new Date(clientData.createdAt).toLocaleString()} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>} />
            <InfoItem label={"updatedAt"}  value={new Date(clientData.updatedAt).toLocaleString()} icon={(props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>} />

          </div>
        </div>
      </div>

    </div>
  )
}