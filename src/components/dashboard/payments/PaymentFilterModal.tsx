"use client"

import React from "react"
import { X, Filter } from "lucide-react"
import { format, parse } from "date-fns"
import { fr } from "date-fns/locale"

interface PaymentFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: () => void
  status: string
  setStatus: (value: string) => void
  customerId: string
  setCustomerId: (value: string) => void
  unpaidInMonth: string
  setUnpaidInMonth: (value: string) => void
  onClearFilters: () => void
  onFilterUnpaidThisMonth: () => void
}

export default function PaymentFilterModal({
  isOpen,
  onClose,
  onApplyFilters,
  status,
  setStatus,
 
 
  customerId,
  setCustomerId,
  unpaidInMonth,
  setUnpaidInMonth,
  onClearFilters,
  onFilterUnpaidThisMonth,
}: PaymentFilterModalProps) {
  const formattedMonth = React.useMemo(() => {
    if (!unpaidInMonth) return ""
    const date = parse(unpaidInMonth, "yyyy-MM", new Date())
    return format(date, "MMMM yyyy", { locale: fr })
  }, [unpaidInMonth])

  const handleApplyAndClose = () => {
    onApplyFilters()
    onClose()
  }

  const handleClearAndClose = () => {
    onClearFilters()
    onClose()
  }

  const handleFilterUnpaidAndClose = () => {
    onFilterUnpaidThisMonth()
    onClose()
  }

  const handlePendingAndClose = () => {
    setStatus("PENDING")
    onApplyFilters()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres des paiements
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut du paiement</label>
            <select className="w-full p-2 border rounded-md" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tous les statuts</option>
              <option value="COMPLETED">Complété</option>
              <option value="PENDING">En attente</option>
              <option value="FAILED">Échoué</option>
            </select>
          </div>

          {/* ID du client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID du client</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              placeholder="Entrer l'ID du client"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            />
          </div>

          {/* Non payé ce mois-ci */}
          <div lang="fr">
            <label className="block text-sm font-medium text-gray-700 mb-1">Non payé ce mois {formattedMonth}</label>
            <input
              type="month"
              className="w-full p-2 border rounded-md"
              value={unpaidInMonth}
              onChange={(e) => setUnpaidInMonth(e.target.value)}
            />
          </div>

         
           
        </div>

        {/* Actions de filtre */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleApplyAndClose}
          >
            Appliquer les filtres
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center gap-1"
            onClick={handleClearAndClose}
          >
            <X className="w-4 h-4" /> Réinitialiser les filtres
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            onClick={handlePendingAndClose}
          >
            Paiements en attente
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            onClick={handleFilterUnpaidAndClose}
          >
            Non payés ce mois
          </button>
        </div>
      </div>
    </div>
  )
}
