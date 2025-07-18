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
   status: string
  invoiceNumber?: string
  receiptNumber?: string
  notes?: string
}

interface ClientDetailPageProps {
  customerId: number  
  client: Client
}

export default function ClientDetailPage({ customerId ,client}: ClientDetailPageProps) {
   const [payments, setPayments] = useState<Payment[]>([])
   

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
 

  if (!client) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-600">Client not found{JSON.stringify(client)}</h2>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      
 
      {/* Tab Content */}
      { (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Nom complet</label>
                <p className="mt-1 text-gray-900">{client.firstName} {client.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Date de naissance</label>
                <p className="mt-1 text-gray-900">{client.dateOfBirth ? formatDate(client.dateOfBirth) : 'Non fourni'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Sexe</label>
                <p className="mt-1 text-gray-900">{client.gender || 'Non spécifié'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1 text-gray-900">{client.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Téléphone</label>
                <p className="mt-1 text-gray-900">{client.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Adresse</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600">Adresse</label>
                <p className="mt-1 text-gray-900">{client.streetAddress || 'Non fourni'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Ville</label>
                <p className="mt-1 text-gray-900">{client.city || 'Non fourni'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">État</label>
                <p className="mt-1 text-gray-900">{client.state || 'Non fourni'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Code de l’état</label>
                <p className="mt-1 text-gray-900">{client.stateCode || 'Non fourni'}</p>
              </div>
            </div>
          </div>

          {/* Contact d'urgence */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Contact d'urgence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Nom du contact</label>
                <p className="mt-1 text-gray-900">{client.emergencyContact || 'Non fourni'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Téléphone du contact</label>
                <p className="mt-1 text-gray-900">{client.emergencyPhone || 'Non fourni'}</p>
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
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Adhésion</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-blue-700">Type</label>
                <p className="mt-1 text-blue-900">{client.membershipType || 'Standard'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700">Statut</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(client.status || 'active')}`}>
                  {client.status || 'Actif'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700">Date de début</label>
                <p className="mt-1 text-blue-900">{client.membershipStartDate ? formatDate(client.membershipStartDate) : formatDate(client.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700">Date de fin</label>
                <p className="mt-1 text-blue-900">{client.membershipEndDate ? formatDate(client.membershipEndDate) : 'Pas de date de fin'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700">UUID</label>
                <p className="mt-1 text-xs text-blue-700 font-mono break-all">{client.uuid}</p>
              </div>
            </div>
          </div>

        

            {/* Quick Actions */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Envoyer un e-mail
              </button>
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Planifier une séance
              </button>
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Voir les présences
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
 
 
    </div>
  )
}