"use client"
import { useState, useEffect } from "react"
import type React from "react"
import toast from "react-hot-toast"

import type { Payment, PaymentCreateDTO, PaymentUpdateDTO } from "@/types/payment"
import { PaymentMethod, PaymentStatus } from "@/types/payment"
import type { Customer } from "@/types/customer"

interface PaymentFormModalProps {
  mode: "create" | "update"
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>, data: any) => void
  data?: Payment | PaymentCreateDTO | PaymentUpdateDTO
  customerId?: number // Optional prop to pre-select customer
}

export default function PaymentFormModal({ mode, isOpen, onClose, onSubmit, data, customerId }: PaymentFormModalProps) {
  const [formData, setFormData] = useState<any>({
    customerId: customerId || "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: PaymentMethod.CASH,
    status: PaymentStatus.COMPLETED,
    notes: "",
    invoiceNumber: "",
    receiptNumber: "",
    transactionReference: "",
   
    totalAmount: 0 
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Tax rate configuration (you can make this configurable)
   const STORE_PREFIX = "GS" // Grocery Store prefix
  
  // Generate unique invoice number
  const generateInvoiceNumber = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const timestamp = now.getTime().toString().slice(-6)
    return `${STORE_PREFIX}-INV-${year}${month}${day}-${timestamp}`
  }

  // Generate unique receipt number
  const generateReceiptNumber = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const timestamp = now.getTime().toString().slice(-6)
    return `${STORE_PREFIX}-REC-${year}${month}${day}-${timestamp}`
  }

  // Generate transaction reference for card payments
  const generateTransactionReference = (method: string) => {
    if (method === PaymentMethod.CASH) return ""
    const now = new Date()
    const timestamp = now.getTime().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `TXN-${timestamp.slice(-8)}-${random}`
  }
 
   useEffect(() => {
    if (formData.amount && !isNaN(parseFloat(formData.amount))) {
      const subtotal = parseFloat(formData.amount)
      const calculations =  subtotal 
      
      setFormData(prev => ({
        ...prev, 
        totalAmount: calculations 
      }))
    }
  }, [formData.amount ])

  // Auto-generate numbers when payment method changes
  useEffect(() => {
    if (autoGenerate && mode === "create") {
      setFormData(prev => ({
        ...prev,
        invoiceNumber: generateInvoiceNumber(),
        receiptNumber: generateReceiptNumber(),
        transactionReference: generateTransactionReference(prev.paymentMethod)
      }))
    }
  }, [formData.paymentMethod, autoGenerate, mode])

  // Initialize form data
  useEffect(() => {
    if (data) {
      if ("paymentId" in data) {
        const { paymentId, createdAt, updatedAt, ...rest } = data as Payment
        setFormData(rest)
        setAutoGenerate(false) // Don't auto-generate for existing payments
      } else {
        setFormData({...formData, ...data})
      }
    } else if (mode === "create" && autoGenerate) {
      // Auto-generate for new payments
      setFormData(prev => ({
        ...prev,
        invoiceNumber: generateInvoiceNumber(),
        receiptNumber: generateReceiptNumber(),
        transactionReference: generateTransactionReference(prev.paymentMethod)
      }))
    }
  }, [data])

  // Fetch customers for dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customers?limit=100`)
        if (response.ok) {
          const { result } = await response.json()
          setCustomers(result)
          
          // Set selected customer if customerId is provided
          if (customerId) {
            const customer = result.find((c: Customer) => c.customerId === customerId)
            setSelectedCustomer(customer || null)
          }
        }
      } catch (error) {
        console.error("Error fetching customers:", error)
        toast.error("Could not load customers list")
      } finally {
        setIsLoadingCustomers(false)
      }
    }

    fetchCustomers()
  }, [customerId])

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }))

    // Update selected customer when customerId changes
    if (key === "customerId") {
      const customer = customers.find(c => c.customerId === parseInt(value))
      setSelectedCustomer(customer || null)
    }

    // Regenerate transaction reference when payment method changes
    if (key === "paymentMethod" && autoGenerate && mode === "create") {
      setFormData((prev: any) => ({
        ...prev,
        [key]: value,
        transactionReference: generateTransactionReference(value)
      }))
    }
  }

  const handleRegenerateNumbers = () => {
    setFormData(prev => ({
      ...prev,
      invoiceNumber: generateInvoiceNumber(),
      receiptNumber: generateReceiptNumber(),
      transactionReference: generateTransactionReference(prev.paymentMethod)
    }))
    toast.success("Numbers regenerated successfully!")
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Validation
    if (!formData.customerId) {
      toast.error("Please select a customer")
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    // Prepare submission data
    const submissionData = {
      ...formData,
      amount: parseFloat(formData.totalAmount || formData.amount), // Use calculated total
      totalAmount: parseFloat(formData.totalAmount || formData.amount),
     
      customerId: parseInt(formData.customerId),
      ...(mode === "create" && { createdBy: 1 }), // Replace with actual logged in user ID
    }

    onSubmit(event, submissionData)
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case PaymentMethod.CASH: return "💵"
      case PaymentMethod.CREDIT_CARD: return "💳"
      case PaymentMethod.DEBIT_CARD: return "💳"
      case PaymentMethod.BANK_TRANSFER: return "🏦"
      case PaymentMethod.ONLINE: return "🌐"
      default: return "💰"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 md:mx-auto my-auto overflow-y-auto max-h-[95vh]">
        <div className="relative">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
           
            
  {mode === "create" ? "🛒 Nouvelle transaction de paiement" : "Mettre à jour le paiement"}
  
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 right-2 p-2 bg-gray-200 rounded-md hover:bg-gray-400 focus:outline-none transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer & Payment Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            {mode !== "update" && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Informations sur le client</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Sélectionner un client</label>
                    <select
                      value={formData?.customerId || ""}
                      onChange={(e) => handleInputChange("customerId", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500"
                      required
                      disabled={isLoadingCustomers || !!customerId}
                    >
                      <option value="">Choisir un client...</option>
                      {customers.map((customer) => (
                        <option key={customer.customerId} value={customer.customerId}>
                          {customer.firstName} {customer.lastName} - {customer.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedCustomer && (
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-600">
                        <strong>Téléphone :</strong> {selectedCustomer.phoneNumber} | 
                        <strong> Statut :</strong> {selectedCustomer.status} |
                        <strong> Type :</strong> {selectedCustomer.membershipType}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Détails du paiement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">Montant total ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData?.amount || ""}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-green-500"
                    required
                    placeholder="0.00"
                  />
                </div>

                <div style={{display:"none"}}>
                  <label className="block text-gray-700 text-sm font-bold mb-1">Remise (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData?.discount || ""}
                    onChange={(e) => handleInputChange("discount", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-green-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">Date de paiement</label>
                  <input
                    type="date"
                    value={formData?.paymentDate ? new Date(formData.paymentDate).toISOString().split("T")[0] : ""}
                    onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">Méthode de paiement</label>
                  <div className="relative">
                    <select
                      value={formData?.paymentMethod || PaymentMethod.CASH}
                      onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                      className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:border-green-500 appearance-none"
                      required
                    >
                      <option value={PaymentMethod.CASH}>CACHE</option>
                      <option value={PaymentMethod.CREDIT_CARD}>BANKILY</option>
                      <option value={PaymentMethod.DEBIT_CARD}>SADAD</option>
                      <option value={PaymentMethod.BANK_TRANSFER}>MASRIVY</option>
                      <option value={PaymentMethod.ONLINE}>Paiement en ligne</option>
                    </select>
                  </div>
                </div>
 
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">Statut du paiement</label>
                  <select
                    value={formData?.status || PaymentStatus.COMPLETED}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-green-500"
                    required
                  >
                    <option value={PaymentStatus.COMPLETED}>Terminé</option>
                    <option value={PaymentStatus.PENDING}>En attente</option>
                    <option value={PaymentStatus.FAILED}>Échoué</option>
                    <option value={PaymentStatus.REFUNDED}>Remboursé</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transaction References */}
            <div className="bg-orange-50 p-4  rounded-lg" style={{display:"none"}} >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-orange-900">Références de la transaction</h3>
                {mode === "create" && (
                  <button
                    type="button"
                    onClick={handleRegenerateNumbers}
                    className="text-sm bg-orange-200 hover:bg-orange-300 px-3 py-1 rounded transition-colors"
                  >
                    Régénérer
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">Numéro de facture</label>
                  <input
                    type="text"
                    value={formData?.invoiceNumber || ""}
                    onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-500 font-mono text-sm"
                    placeholder="Auto-generated"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">Numéro de reçu</label>
                  <input
                    type="text"
                    value={formData?.receiptNumber || ""}
                    onChange={(e) => handleInputChange("receiptNumber", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-500 font-mono text-sm"
                    placeholder="Auto-generated"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-1">Référence de transaction</label>
                  <input
                    type="text"
                    value={formData?.transactionReference || ""}
                    onChange={(e) => handleInputChange("transactionReference", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-orange-500 font-mono text-sm"
                    placeholder={formData.paymentMethod === PaymentMethod.CASH ? "Non requis pour les espèces" : "Généré automatiquement"}
                    disabled={formData.paymentMethod === PaymentMethod.CASH}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">Notes supplémentaires</label>
              <textarea
                value={formData?.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500"
                rows={3}
placeholder="Toute information supplémentaire sur cette transaction..."
              />
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Récapitulatif du paiement</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total :</span>
                  {/* <span className="font-medium">${(formData.totalAmount || 0).toFixed(2)}</span> */}
                </div>
                
            
                <hr className="my-2" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">${(formData.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-100 rounded text-center">
                <div className="text-2xl mb-1">{getPaymentMethodIcon(formData.paymentMethod)}</div>
                <div className="text-sm font-medium text-blue-800">
                  {formData.paymentMethod?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Cash'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {mode === "create" ? "💾 Process Payment" : "✅ Update Payment"}
              </button>
              <button 
                type="button" 
                onClick={onClose} 
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                ❌ Cancel
              </button>
            </div>

            {/* Auto-generate toggle */}
            {mode === "create" && (
              <div style={{display:"none"}} className="p-3 bg-yellow-50 rounded-lg">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoGenerate}
                    onChange={(e) => setAutoGenerate(e.target.checked)}
                    className="rounded"
                  />
                  <span>🔄 Auto-generate reference numbers</span>
                </label>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}