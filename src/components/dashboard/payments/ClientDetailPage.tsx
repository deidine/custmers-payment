"use client"
import { useState, useEffect } from "react"
import type React from "react"
import toast from "react-hot-toast"

interface Client {
  customerId: number
  uuid: string
  phoneNumber: string
  email: string
  address?: string
  createdAt: string
  updatedAt: string
  firstName: string
  lastName: string
  gender?: string
  dateOfBirth?: string
  emergencyContact?: string
  emergencyPhone?: string
  streetAddress?: string
  city?: string
  state?: string
  stateCode?: string
  membershipType?: string
  membershipStartDate?: string
  membershipEndDate?: string
  status?: string
  notes?: string
}

interface Payment {
  paymentId: number
  amount: number
  paymentDate: string
  paymentMethod: string
  paymentType: string
  status: string
  invoiceNumber?: string
  receiptNumber?: string
  notes?: string
}

interface ClientDetailPageProps {
  customerId: number  
}

export default function ClientDetailPage({ customerId }: ClientDetailPageProps) {
  const [client, setClient] = useState<Client | null>()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPayments, setIsLoadingPayments] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "activity">("overview")

  useEffect(() => {
    fetchClientDetails()
    fetchClientPayments()
  }, [customerId])

  const fetchClientDetails = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/${customerId}`)
      if (response.ok) {
const data = await response.json()
setClient(data)
       } else {
        toast.error("Failed to load client details")
      }
    } catch (error) {
      console.error("Error fetching client:", error)
      toast.error("Error loading client details")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClientPayments = async () => {
    setIsLoadingPayments(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/payments?customerId=${customerId}`)
      if (response.ok) {
        const { data, totalItems } = await response.json()
        
        setPayments( data)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Error loading payment history")
    } finally {
      setIsLoadingPayments(false)
    }
  }


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateTotalPayments = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-600">Client not found{JSON.stringify(client)}</h2>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-blue-100 mb-1">{client.email}</p>
            <p className="text-blue-100">{client.phoneNumber}</p>
            <div className="flex items-center mt-3 space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(client.status || 'active')}`}>
                {client.status || 'Active'}
              </span>
              <span className="text-blue-100 text-sm">
                Member since {client.membershipStartDate ? formatDate(client.membershipStartDate) : formatDate(client.createdAt)}
              </span>
            </div>
          </div>
       
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "payments"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Payments ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "activity"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Activity
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Full Name</label>
                  <p className="mt-1 text-gray-900">{client.firstName} {client.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                  <p className="mt-1 text-gray-900">{client.dateOfBirth ? formatDate(client.dateOfBirth) : 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Gender</label>
                  <p className="mt-1 text-gray-900">{client.gender || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="mt-1 text-gray-900">{client.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <p className="mt-1 text-gray-900">{client.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600">Street Address</label>
                  <p className="mt-1 text-gray-900">{client.streetAddress || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">City</label>
                  <p className="mt-1 text-gray-900">{client.city || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">State</label>
                  <p className="mt-1 text-gray-900">{client.state || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">State Code</label>
                  <p className="mt-1 text-gray-900">{client.stateCode || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Contact Name</label>
                  <p className="mt-1 text-gray-900">{client.emergencyContact || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Contact Phone</label>
                  <p className="mt-1 text-gray-900">{client.emergencyPhone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Membership Info */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Membership</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-700">Type</label>
                  <p className="mt-1 text-blue-900">{client.membershipType || 'Standard'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(client.status || 'active')}`}>
                    {client.status || 'Active'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">Start Date</label>
                  <p className="mt-1 text-blue-900">{client.membershipStartDate ? formatDate(client.membershipStartDate) : formatDate(client.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">End Date</label>
                  <p className="mt-1 text-blue-900">{client.membershipEndDate ? formatDate(client.membershipEndDate) : 'No end date'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">UUID</label>
                  <p className="mt-1 text-xs text-blue-700 font-mono break-all">{client.uuid}</p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-green-700">Total Payments</label>
                  <p className="mt-1 text-2xl font-bold text-green-900">{formatCurrency(calculateTotalPayments())}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700">Number of Payments</label>
                  <p className="mt-1 text-green-900">{payments.length}</p>
                </div>
                
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Send Email
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Schedule Session
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  View Check-ins
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Payment History</h3>
       
          </div>

          {isLoadingPayments ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No payments found for this client.</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <li key={payment.paymentId} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {payment.paymentType} • {payment.paymentMethod}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>{formatDate(payment.paymentDate)}</p>
                          </div>
                        </div>
                        {payment.notes && (
                          <p className="mt-2 text-sm text-gray-600">{payment.notes}</p>
                        )}
                        <div className="mt-2 text-xs text-gray-400">
                          {payment.invoiceNumber && `Invoice: ${payment.invoiceNumber}`}
                          {payment.receiptNumber && ` • Receipt: ${payment.receiptNumber}`}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div>
          <h3 className="text-lg font-semibold mb-6">Activity Log</h3>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">Activity tracking coming soon...</p>
            <p className="text-sm text-gray-400 mt-2">This will show check-ins, session history, and other activities.</p>
          </div>
        </div>
      )}
    </div>
  )
}