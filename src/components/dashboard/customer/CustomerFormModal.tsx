"use client"
import { useState, useEffect, useMemo } from "react"
import type React from "react"

import type { Customer, CustomerCreateDTO, CustomerUpdateDTO } from "@/types/customer"
import { Gender, CustomerStatus, MembershipType } from "@/types/customer"

interface CustomerFormModalProps {
  mode: "create" | "update"
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>, data: any) => void
  data?: Customer | CustomerCreateDTO | CustomerUpdateDTO
}

export default function CustomerFormModal({ mode, isOpen, onClose, onSubmit, data }: CustomerFormModalProps) {
  // Filter out customerId, createdAt, updatedAt from data
  const filteredData = useMemo(() => {
    if (!data) return null
    if ("customerId" in data) {
      const { customerId, createdAt, updatedAt, ...rest } = data
      return rest
    }

    return data
  }, [data, mode])

  const [formData, setFormData] = useState<any>(filteredData)

  useEffect(() => {
    setFormData(filteredData)
  }, [filteredData])

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(event, formData)
  }

  if (!isOpen) return null

return (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 md:mx-auto my-auto overflow-y-auto max-h-[90vh]">
      <div className="relative">
        <h2 className="text-xl font-bold mb-4">{mode === "create" ? "Ajouter un nouveau membre" : "Mettre à jour le membre"}</h2>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-0 right-2 p-2 bg-gray-200 rounded-md hover:bg-gray-400 focus:outline-none"
        >
          X
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section Informations de base */}
        <div className="col-span-2">
          <h3 className="text-lg font-semibold border-b pb-2 mb-3">Informations de base</h3>
        </div>

        {/* Prénom */}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Prénom</label>
          <input
            type="text"
            value={formData?.firstName || ""}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            required
          />
        </div>

        {/* Nom */}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Nom</label>
          <input
            type="text"
            value={formData?.lastName || ""}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            required
          />
        </div>

        {/* Sexe */}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Sexe</label>
          <select
            value={formData?.gender || ""}
            onChange={(e) => handleInputChange("gender", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
          >
            <option value="">Sélectionner le sexe</option>
            <option value={Gender.MALE}>Homme</option>
            <option value={Gender.FEMALE}>Femme</option>
          </select>
        </div>

        {/* Date de naissance */}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Date de naissance</label>
          <input
            type="date"
            value={formData?.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split("T")[0] : ""}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
          />
        </div>

        {/* Section Informations de contact */}
        <div className="col-span-2 mt-4">
          <h3 className="text-lg font-semibold border-b pb-2 mb-3">Informations de contact</h3>
        </div>

        {/* Email */}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Email</label>
          <input
            type="email"
            value={formData?.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
          />
        </div>

        {/* Numéro de téléphone */}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Numéro de téléphone</label>
          <input
            type="text"
            value={formData?.phoneNumber || ""}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
          />
        </div>
        {/* Téléphone d'urgence */}
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Téléphone d'urgence</label>
          <input
            type="text"
            value={formData?.emergencyPhone || ""}
            onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
          />
        </div>

        {/* Contact d'urgence */}
        <div  style={{display:"none"}}  className="mb-2">
          {/* <label className="block text-gray-700 text-sm font-bold mb-1">Contact d'urgence</label> */}
          <input
            type="text"
            hidden
            value={formData?.emergencyContact || "notimportent"}
            onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
          />
        </div>


        {/* Section Adresse */}
        <div  style={{display:"none"}}  className="col-span-2 mt-4">
          <h3 className="text-lg font-semibold border-b pb-2 mb-3">Adresse</h3>
        </div>

        {/* Adresse */}
        <div  style={{display:"none"}}  className="col-span-2 mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Adresse</label>
          <textarea
            value={formData?.streetAddress || ""}
            onChange={(e) => handleInputChange("streetAddress", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            rows={2}
          />
        </div>

        {/* Ville */}
        <div  style={{display:"none"}}  className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Ville</label>
          <input
            type="text"
            value={formData?.city || "nouakchott"}
            onChange={(e) => handleInputChange("city", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
          />
        </div>

        {/* État */}
        <div  style={{display:"none"}}  className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">État</label>
          <input
            type="text"
            value={formData?.state || "mauritanie"}
            onChange={(e) => handleInputChange("state", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
          />
        </div>

        {/* Code de l'état */}
        <div  style={{display:"none"}}  className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Code de l'état</label>
          <input
            type="text"
            value={formData?.stateCode || "222"}
            onChange={(e) => handleInputChange("stateCode", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
          />
        </div>

        {/* Section Adhésion */}
        <div style={{display:"none"}}  className="col-span-2 mt-4">
          <h3 className="text-lg font-semibold border-b pb-2 mb-3">Informations sur l'adhésion</h3>
        </div>

        {/* Type d'adhésion */}
        <div style={{display:"none"}} className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Type d'adhésion</label>
          <select
            value={formData?.membershipType || "BASIC"}
            onChange={(e) => handleInputChange("membershipType", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            required
          >
            <option value={MembershipType.BASIC}>Basique</option>
            <option value={MembershipType.STANDARD}>Standard</option>
            <option value={MembershipType.PREMIUM}>Premium</option>
            <option value={MembershipType.VIP}>VIP</option>
          </select>
        </div>

        {/* Statut d'adhésion */}
        <div  style={{display:"none"}}  className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Statut d'adhésion</label>
          <select
            value={formData?.status || "ACTIVE"}
            onChange={(e) => handleInputChange("status", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            required
          >
            <option value={CustomerStatus.ACTIVE}>Actif</option>
            <option value={CustomerStatus.INACTIVE}>Inactif</option>
            <option value={CustomerStatus.SUSPENDED}>Suspendu</option>
          </select>
        </div>

        {/* Date de début */}
        <div  style={{display:"none"}}  className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Date de début d'adhésion</label>
          <input
            type="date"
            value={
              formData?.membershipStartDate ? new Date(formData.membershipStartDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
            }
            onChange={(e) => handleInputChange("membershipStartDate", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
          />
        </div>

        {/* Date de fin */}
        <div  style={{display:"none"}}  className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Date de fin d'adhésion</label>
          <input
            type="date"
            value={
              formData?.membershipEndDate ? new Date(formData.membershipEndDate).toISOString().split("T")[0] :  new Date().toISOString().split("T")[0]
            }
            onChange={(e) => handleInputChange("membershipEndDate", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
          />
        </div>

        {/* Section Informations supplémentaires */}
        <div className="col-span-2 mt-4">
          <h3 className="text-lg font-semibold border-b pb-2 mb-3">Informations supplémentaires</h3>
        </div>

        {/* Notes */}
        <div className="col-span-2 mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Notes</label>
          <textarea
            value={formData?.notes || ""}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            rows={3}
          />
        </div>

        <div className="col-span-2 flex justify-end mt-4">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded mr-2">
            {mode === "create" ? "Créer" : "Enregistrer"}
          </button>
          <button type="button" onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
            Annuler
          </button>
        </div>
      </form>
    </div>
  </div>
)

}
