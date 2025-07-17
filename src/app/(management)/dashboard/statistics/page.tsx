"use client"

import { useEffect, useState } from "react"
  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PaymentRow } from "@/types"
import { getPaymentStatistics, getCustomerStatistics } from "@/db/statistics"
import DashboardLayout from "@/components/dashboard/DashboardLayout"

interface PaymentStats {
  totalPaymentsToday: number
  totalPaymentsThisWeek: number
  totalPaymentsThisMonth: number
  dailyPaymentData: { date: string; amount: number }[]
  recentPayments: PaymentRow[]
}

interface CustomerStats {
  totalCustomers: number
  newCustomersThisMonth: number
}

export default function DashboardPage() {
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null)
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [payments, customers] = await Promise.all([getPaymentStatistics(), getCustomerStatistics()])
        setPaymentStats(payments)
        setCustomerStats(customers)
      } catch (err) {
        console.error("Échec du chargement des données :", err)
        setError("Échec du chargement des données. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Chargement des statistiques...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-700 p-4 rounded-md">
        <p className="text-lg">{error}</p>
      </div>
    )
  }

  return (
           <DashboardLayout title={"clientPresence"} activeSlug={"statistics"}>
 
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8 lg:p-10">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Tableau de Bord des Paiements</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card: Paiements du Jour */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between border border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Paiements du Jour</h2>
            <p className="text-4xl font-bold text-gray-900">
              {paymentStats?.totalPaymentsToday?.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-4">Total des paiements reçus aujourd'hui.</p>
        </div>

        {/* Card: Paiements de la Semaine */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between border border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Paiements de la Semaine</h2>
            <p className="text-4xl font-bold text-gray-900">
              {paymentStats?.totalPaymentsThisWeek?.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-4">Total des paiements reçus cette semaine.</p>
        </div>

        {/* Card: Paiements du Mois */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between border border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Paiements du Mois</h2>
            <p className="text-4xl font-bold text-gray-900">
              {paymentStats?.totalPaymentsThisMonth?.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-4">Total des paiements reçus ce mois-ci.</p>
        </div>

        {/* Card: Statistiques Clients */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between border border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Statistiques Clients</h2>
            <p className="text-4xl font-bold text-gray-900">{customerStats?.totalCustomers}</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Nouveaux clients ce mois-ci : <span className="font-semibold">{customerStats?.newCustomersThisMonth}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart: Tendances des Paiements */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Tendances des Paiements (30 derniers jours)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paymentStats?.dailyPaymentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${value}€`} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) =>
                    `${value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`
                  }
                  labelFormatter={(label: string) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "0.5rem",
                    padding: "0.5rem",
                  }}
                  labelStyle={{ color: "#374151", fontWeight: "bold" }}
                  itemStyle={{ color: "#1f2937" }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#4f46e5" // Un joli violet/indigo
                  strokeWidth={2}
                  dot={{ stroke: "#4f46e5", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#4f46e5", strokeWidth: 2, fill: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card: Derniers Paiements */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Derniers Paiements</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Montant
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentStats?.recentPayments.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.customer_name || `Client #${payment.customer_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.payment_date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status === "PAID" ? "Payé" : payment.status === "PENDING" ? "En attente" : "Annulé"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}
