"use client"
import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react" // Import useRef
import toast from "react-hot-toast"
import { AttendanceStatus } from "@/types/customer"
import DailyPatientAttendanceTable from "@/components/patientAttendance/DailyPatientAttendanceTable"
import { generateSubscriptionPdf } from "@/db/statistics"
import IFrameCompoent from "@/components/IFrameCompoent"
import PaymentTable from "@/components/dashboard/payments/PaymentTable"
import type { PaymentWithCustomer } from "@/types/payment"
import { dashboardSideItems } from "@/lib/dashboard-items"
import { useUser } from "@/contexts/UserContext"
import PaymentFormModal from "@/components/dashboard/payments/PaymentFormModal"
import ClientDetailPage from "@/components/dashboard/payments/ClientDetailPage"
import { formatDate } from "@/utils/helpers"
import { CheckCircle, XCircle, Scale, Download } from "lucide-react" // Import icons, in 
import { Input } from "@/components/ui/input" // Import Input component
import GymMembershipCard, { GymMembershipCardRef } from "@/components/GymMembershipCard"
import WeightStatisticsChart, { WeightStatisticsChartRef } from "@/components/WeightStatisticsChart"
 
type TabType = "overview" | "attendance" | "payments" | "documents" | "weight-stats"

export default function ClientPresencePage({ params }: { params: { id: string } }) {
  const clientId = params.id ? Number.parseInt(params.id as string, 10) : null
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [tableData, setTableData] = useState<PaymentWithCustomer[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const { user } = useUser()
  const rowOptions =
    dashboardSideItems({ role: user?.role ?? "" }).find((item) => item.id === "payments")?.options || []
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [clientData, setClientData] = useState<any | null>(null)
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
 
  // State for date range for weight statistics
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(1) // First day of current month
    return d.toISOString().split("T")[0]
  })
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date()
    return d.toISOString().split("T")[0] // Current date
  })

  // Ref for the WeightStatisticsChart component
  const weightChartRef = useRef<WeightStatisticsChartRef>(null)
  // Ref for the GymMembershipCard component
  const gymCardRef = useRef<GymMembershipCardRef>(null)

  const tabs = [
    {
      id: "overview" as TabType,
      name: "Overview",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      count: null,
    },
    {
      id: "attendance" as TabType,
      name: "Attendance",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4"
          />
        </svg>
      ),
      count: attendanceData.length,
    },
    {
      id: "payments" as TabType,
      name: "Payments",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      count: tableData.length,
    },
    {
      id: "documents" as TabType,
      name: "Documents",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z"
          />
        </svg>
      ),
      count: 1,
    },
    {
      id: "weight-stats" as TabType,
      name: "Weight Stats",
      icon: <Scale className="w-5 h-5" />,
      count: attendanceData.length,
    },
  ]
 
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

  const fetchTableData = async (page = 1) => {
    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments?customerId=${clientId}&page=${page}`,
      )
      const itemsPerPage = 10
      if (response.ok) {
        const { data, totalItems } = await response.json()
        setTotalPages(Math.ceil(totalItems / itemsPerPage))
        const tableData = data as PaymentWithCustomer[]
        setTableData(tableData)
      } else {
        throw new Error("Failed to fetch payments.")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error fetching payment data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTableData()
  }, [clientId])

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
      fetchTableData()
      setActiveTab("payments") // Switch to payments tab after creating payment
    } catch (error) {
      console.error("Failed to create payment:", error)
      toast.error(error instanceof Error ? error.message : "Create failed")
    } finally {
      toast.dismiss(toastId)
    }
  }

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
      setActiveTab("attendance") // Switch to attendance tab after adding record
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
            Active
          </span>
        )
      case "INACTIVE":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
            Inactive
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            {status}
          </span>
        )
    }
  }

  // Function to check if customer paid this month
  const hasCustomerPaidThisMonth = useCallback(() => {
    if (!clientData || !clientData.priceToPay || !tableData || tableData.length === 0) {
      return false
    }

    const requiredAmount = Number.parseFloat(clientData.priceToPay)
    if (isNaN(requiredAmount) || requiredAmount <= 0) {
      return false // Invalid priceToPay
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    for (const payment of tableData) {
      const paymentDate = new Date(payment.paymentDate)
      if (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear &&
        payment.status === "COMPLETED" &&
        Number.parseFloat(payment.amount) >= requiredAmount
      ) {
        return true // Found a qualifying payment
      }
    }
    return false // No qualifying payment found
  }, [clientData, tableData])

  const paidThisMonth = hasCustomerPaidThisMonth()

  // Handle PDF download for Weight Statistics Chart
  const handleDownloadReportPdf = async () => {
    if (weightChartRef.current) {
      await weightChartRef.current.generatePdf()
    } else {
      toast.error("Chart component not ready for PDF generation.")
    }
  }

  // Handle PDF download for Gym Membership Card
  const handleDownloadCardPdf = async () => {
    if (gymCardRef.current) {
      await gymCardRef.current.generatePdf()
    } else {
      toast.error("Membership card component not ready for PDF generation.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-80 animate-pulse mb-4"></div>
            <div className="flex items-center gap-4">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md w-32 animate-pulse"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20 animate-pulse"></div>
            </div>
          </div>
          {/* Tabs Skeleton */}
          <div className="flex space-x-1 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-32 animate-pulse"
              ></div>
            ))}
          </div>
          {/* Content Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">Error Loading Data</h3>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-base leading-relaxed">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">Client Not Found</h3>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-base leading-relaxed">
                The requested client information could not be found. Please check the client ID and try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Client ID</p>
                    <p className="text-2xl font-bold text-blue-900">{clientData.codePatient}</p>
                  </div>
                  <div className="p-3 bg-blue-200 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Status</p>
                    <div className="mt-2">{getStatusBadge(clientData.status)}</div>
                    <span className="  text-sm">
                      Membre depuis{" "}
                      {clientData.membershipStartDate
                        ? formatDate(clientData.membershipStartDate)
                        : formatDate(clientData.createdAt)}
                    </span>
                  </div>
                  <div className="p-3 bg-green-200 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Records</p>
                    <p className="text-2xl font-bold text-purple-900">{attendanceData.length + tableData.length}</p>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              {/* New card for payment status */}
              <div
                className={`rounded-xl p-6 border ${
                  paidThisMonth
                    ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
                    : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${paidThisMonth ? "text-emerald-600" : "text-red-600"}`}>
                      Monthly Fee Status
                    </p>
                    <p className={`text-2xl font-bold ${paidThisMonth ? "text-emerald-900" : "text-red-900"}`}>
                      {paidThisMonth ? "Paid" : "Not Paid"}
                    </p>
                    <span className="text-sm text-gray-600">Required: {clientData.priceToPay}</span>
                  </div>
                  <div className={`p-3 rounded-lg ${paidThisMonth ? "bg-emerald-200" : "bg-red-200"}`}>
                    {paidThisMonth ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <ClientDetailPage client={clientData} customerId={Number(params.id)} />
          </div>
        )
      case "attendance":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
              <button
                onClick={() => setIsAddAttendanceModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Record
              </button>
            </div>
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
        )
      case "payments":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Payment
              </button>
            </div>
            <PaymentTable tableData={tableData} onRefresh={fetchTableData} rowOptions={rowOptions} />
          </div>
        )
      case "documents":
        return (
          <div className="space-y-6">
            {/* New section for Gym Membership Card */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Membership Card</h3>
                <button
                  onClick={handleDownloadCardPdf}
                  className="download-button bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Card as PDF
                </button>
              </div>
              <GymMembershipCard ref={gymCardRef} clientData={clientData} />
            </div>
          </div>
        )
      case "weight-stats":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Weight Advancement Chart</h3>
              <div className="flex items-center gap-2">
                <label htmlFor="start-date" className="sr-only">
                  Start Date
                </label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto"
                />
                <span className="text-gray-500">-</span>
                <label htmlFor="end-date" className="sr-only">
                  End Date
                </label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto"
                />
                <button
                  onClick={handleDownloadReportPdf} // Changed to download function
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download Report as PDF
                </button>
              </div>
            </div>
            <WeightStatisticsChart
              ref={weightChartRef}
              attendanceData={attendanceData}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{clientData.nom}</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  ID: {clientData.codePatient}
                </span>
                {getStatusBadge(clientData.status)}
              </div>
            </div>
          </div>
        </div>
        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 bg-white rounded-t-2xl">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 flex items-center gap-2`}
                >
                  {tab.icon}
                  {tab.name}
                  {tab.count !== null && tab.count > 0 && (
                    <span
                      className={`${
                        activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                      } ml-2 py-0.5 px-2 rounded-full text-xs font-medium`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl rounded-t-none shadow-xl border border-gray-100 border-t-0">
          <div className="p-6">{renderTabContent()}</div>
        </div>
        {/* Modals */}
        {isCreateModalOpen && (
          <PaymentFormModal
            mode={"create"}
            customerId={Number.parseInt(params.id)}
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateSubmit}
          />
        )}
      </div>
    </div>
  )
}
