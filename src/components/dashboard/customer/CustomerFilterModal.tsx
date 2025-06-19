"use client"
import { X, Filter } from "lucide-react"

interface CustomerFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: () => void
  membershipType: string
  setMembershipType: (value: string) => void
  status: string
  setStatus: (value: string) => void
  unpaidThisMonth: boolean
  setUnpaidThisMonth: (value: boolean) => void
  onClearFilters: () => void
  onFilterUnpaidThisMonth: () => void
}

export default function CustomerFilterModal({
  isOpen,
  onClose,
  onApplyFilters,
  membershipType,
  setMembershipType,
  status,
  setStatus,
  unpaidThisMonth,
  setUnpaidThisMonth,
  onClearFilters,
  onFilterUnpaidThisMonth,
}: CustomerFilterModalProps) {
  // Get current month for display
  const currentDate = new Date()
  const formattedMonth = currentDate.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  })

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres des clients
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Filter by membership type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'adhésion</label>
            <select
              className="w-full p-2 border rounded-md"
              value={membershipType}
              onChange={(e) => setMembershipType(e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="BASIC">Basique</option>
              <option value="PREMIUM">Premium</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          {/* Filter by status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut du client</label>
            <select className="w-full p-2 border rounded-md" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tous les statuts</option>
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Inactif</option>
              <option value="SUSPENDED">Suspendu</option>
            </select>
          </div>

          {/* Unpaid this month checkbox */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Non payé ce mois ({formattedMonth})</label>
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
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={handleFilterUnpaidAndClose}
          >
            Non payés ce mois
          </button>
        </div>
      </div>
    </div>
  )
}
