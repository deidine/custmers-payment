"use client"
import { useState, useEffect, useMemo } from "react"
import type React from "react"

import type { User, UserCreateDTO, UserUpdateDTO } from "@/types/user"

interface UserFormModalProps {
  mode: "create" | "update"
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>, data: any) => void
  data?: User | UserCreateDTO | UserUpdateDTO
}

export default function UserFormModal({ mode, isOpen, onClose, onSubmit, data }: UserFormModalProps) {
  // Filter out userId, createdAt, updatedAt from data - cached this
  const filteredData = useMemo(() => {
    if (!data) return null
    if ("userId" in data) {
      const { userId, createdAt, updatedAt, ...rest } = data
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
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full mx-4 md:mx-auto my-auto overflow-y-auto max-h-[90vh]">
        <div className="relative">
          <h2 className="text-xl font-bold mb-4">{mode === "create" ? "Create User" : "Update User"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 right-2 p-2 bg-gray-200 rounded-md hover:bg-gray-400 focus:outline-none"
          >
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {formData &&
            Object.entries(formData).map(([key, value]) => (
              <div key={key} className="mb-4">
                <label className="block text-gray-700 text-md font-bold mb-2">{key}</label>

                {key === "role" ? (
                  <select
                    value={value as string}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </select>
                ) : key === "isEnabled" ? (
                  <select
                    value={value ? "true" : "false"}
                    onChange={(e) => handleInputChange(key, e.target.value === "true")}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                ) : key === "password" ? (
                  <input
                    type="password"
                    value={(value as string) || ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                  />
                ) : (
                  <input
                    type={typeof value === "number" ? "number" : "text"}
                    value={typeof value === "number" ? (value ?? 0) : (value ?? "")}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                  />
                )}
              </div>
            ))}

          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mr-2">
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
