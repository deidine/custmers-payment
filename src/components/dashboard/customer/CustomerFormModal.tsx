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
          <h2 className="text-xl font-bold mb-4">{mode === "create" ? "Add New Member" : "Update Member"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 right-2 p-2 bg-gray-200 rounded-md hover:bg-gray-400 focus:outline-none"
          >
            X
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information Section */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">Basic Information</h3>
          </div>

          {/* First Name field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">First Name</label>
            <input
              type="text"
              value={formData?.firstName || ""}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
              required
            />
          </div>

          {/* Last Name field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Last Name</label>
            <input
              type="text"
              value={formData?.lastName || ""}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
              required
            />
          </div>

          {/* Gender field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Gender</label>
            <select
              value={formData?.gender || ""}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            >
              <option value="">Select Gender</option>
              <option value={Gender.MALE}>Male</option>
              <option value={Gender.FEMALE}>Female</option>
            </select>
          </div>

          {/* Date of Birth field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Date of Birth</label>
            <input
              type="date"
              value={formData?.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split("T")[0] : ""}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            />
          </div>

          {/* Contact Information Section */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">Contact Information</h3>
          </div>

          {/* Email field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Email</label>
            <input
              type="email"
              value={formData?.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            />
          </div>

          {/* Phone Number field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Phone Number</label>
            <input
              type="text"
              value={formData?.phoneNumber || ""}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            />
          </div>

          {/* Emergency Contact field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Emergency Contact</label>
            <input
              type="text"
              value={formData?.emergencyContact || ""}
              onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            />
          </div>

          {/* Emergency Phone field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Emergency Phone</label>
            <input
              type="text"
              value={formData?.emergencyPhone || ""}
              onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            />
          </div>

          {/* Address Section */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">Address</h3>
          </div>

          {/* Street Address field */}
          <div className="col-span-2 mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Street Address</label>
            <textarea
              value={formData?.streetAddress || ""}
              onChange={(e) => handleInputChange("streetAddress", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
              rows={2}
            />
          </div>

          {/* City field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">City</label>
            <input
              type="text"
              value={formData?.city || ""}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            />
          </div>

          {/* State field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">State</label>
            <input
              type="text"
              value={formData?.state || ""}
              onChange={(e) => handleInputChange("state", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            />
          </div>

          {/* State Code field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">State Code</label>
            <input
              type="text"
              value={formData?.stateCode || ""}
              onChange={(e) => handleInputChange("stateCode", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            />
          </div>

          {/* Membership Section */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">Membership Information</h3>
          </div>

          {/* Membership Type field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Membership Type</label>
            <select
              value={formData?.membershipType || "BASIC"}
              onChange={(e) => handleInputChange("membershipType", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
              required
            >
              <option value={MembershipType.BASIC}>Basic</option>
              <option value={MembershipType.STANDARD}>Standard</option>
              <option value={MembershipType.PREMIUM}>Premium</option>
              <option value={MembershipType.VIP}>VIP</option>
            </select>
          </div>

          {/* Membership Status field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Membership Status</label>
            <select
              value={formData?.status || "ACTIVE"}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
              required
            >
              <option value={CustomerStatus.ACTIVE}>Active</option>
              <option value={CustomerStatus.INACTIVE}>Inactive</option>
              <option value={CustomerStatus.SUSPENDED}>Suspended</option>
            </select>
          </div>

          {/* Membership Start Date field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Membership Start Date</label>
            <input
              type="date"
              value={
                formData?.membershipStartDate ? new Date(formData.membershipStartDate).toISOString().split("T")[0] : ""
              }
              onChange={(e) => handleInputChange("membershipStartDate", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            />
          </div>

          {/* Membership End Date field */}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Membership End Date</label>
            <input
              type="date"
              value={
                formData?.membershipEndDate ? new Date(formData.membershipEndDate).toISOString().split("T")[0] : ""
              }
              onChange={(e) => handleInputChange("membershipEndDate", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-300"
            />
          </div>

          {/* Notes Section */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">Additional Information</h3>
          </div>

          {/* Notes field */}
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
              {mode === "create" ? "Create" : "Save"}
            </button>
            <button type="button" onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
