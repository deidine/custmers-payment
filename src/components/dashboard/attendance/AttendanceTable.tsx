"use client"
import { useState } from "react"
import type React from "react"

import toast from "react-hot-toast"

import type {   User } from "@/types/user"
import { AttendanceStatus } from "@/types/user"
import { useScrollLock } from "@/hooks/useScrollLock"
import DeleteModal from "../DeleteModal"

interface AttendanceTableProps {
  userData: User
  attendanceData: any[]
  onRefresh: () => void
}

export default function AttendanceTable({ userData, attendanceData, onRefresh }: AttendanceTableProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<any | null>(null)
  const [isAttendanceFormOpen, setIsAttendanceFormOpen] = useState(false)
  const [isCheckOutFormOpen, setIsCheckOutFormOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT)
  const [checkInTime, setCheckInTime] = useState<string>("")
  const [checkOutTime, setCheckOutTime] = useState<string>("")
 
  // Lock scroll when any modal is open
  useScrollLock(isDeleteModalOpen || isAttendanceFormOpen || isCheckOutFormOpen)

  const openDeleteModal = (attendance: any) => {
    setSelectedAttendance(attendance)
    setIsDeleteModalOpen(true)
  }

  const openCheckOutModal = (attendance: any) => {
    setSelectedAttendance(attendance)
    setCheckOutTime("")
    setIsCheckOutFormOpen(true)
  }

  const closeModals = () => {
    setIsDeleteModalOpen(false)
    setIsAttendanceFormOpen(false)
    setIsCheckOutFormOpen(false)
    setSelectedAttendance(null)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedAttendance) return

    const toastId = toast.loading("Deleting attendance record...")

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/attendance/${selectedAttendance.attendanceId}`,
        {
          method: "DELETE",
        },
      )

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      toast.success("any record deleted successfully")
      closeModals()
      onRefresh()
    } catch (error) {
      console.error("Failed to delete attendance:", error)
      toast.error(error instanceof Error ? error.message : "Delete failed")
    } finally {
      toast.dismiss(toastId)
    }
  }

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault()

    const toastId = toast.loading("Adding attendance record...")

    try {
      const attendanceData = {
        userId: userData.userId,
        date: selectedDate,
        status: selectedStatus,
        // Only include checkInTime for PRESENT status, and only when provided
        checkInTime: selectedStatus === AttendanceStatus.PRESENT && checkInTime 
          ? new Date(`${selectedDate}T${checkInTime}:00`).toISOString() 
          : undefined,
        // Don't include checkOutTime on initial creation
        checkOutTime: undefined,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      toast.success("any record added successfully")
      setIsAttendanceFormOpen(false)
      resetForm()
      onRefresh()
    } catch (error) {
      console.error("Failed to add attendance:", error)
      toast.error(error instanceof Error ? error.message : "Add failed")
    } finally {
      toast.dismiss(toastId)
    }
  }

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAttendance || !checkOutTime) return

    const toastId = toast.loading("Updating check-out time...")

    try {
      const updateData = {
        attendanceId: selectedAttendance.attendanceId,
         userId: userData.userId,
        checkInTime:  new Date(`${selectedAttendance.date.split('T')[0]}T${checkOutTime}:00`).toISOString(),
        date: selectedAttendance.date,
  status: selectedAttendance.status,
        checkOutTime: new Date(`${selectedAttendance.date.split('T')[0]}T${checkOutTime}:00`).toISOString(),
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      )

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      toast.success("Check-out time updated successfully")
      closeModals()
      onRefresh()
    } catch (error) {
      console.error("Failed to update check-out time:", error)
      toast.error(error instanceof Error ? error.message : "Update failed")
    } finally {
      toast.dismiss(toastId)
    }
  }

  const resetForm = () => {
    setSelectedDate(new Date().toISOString().split("T")[0])
    setSelectedStatus(AttendanceStatus.PRESENT)
    setCheckInTime("")
    setCheckOutTime("")
  }

  // Check if attendance record can be checked out
  const canCheckOut = (attendance: any) => {
    return attendance.status === AttendanceStatus.PRESENT && 
           attendance.checkInTime && 
           !attendance.checkOutTime
  }

  // Check if attendance record can be updated (already has check-out time)
  const canUpdateCheckOut = (attendance: any) => {
    return attendance.status === AttendanceStatus.PRESENT && 
           attendance.checkInTime && 
           attendance.checkOutTime
  }

  // Format attendance status for display
  const formatStatus = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Present</span>
      case AttendanceStatus.ABSENT:
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">Absent</span>
      case AttendanceStatus.ON_LEAVE:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">On Leave</span>
      default:
        return status
    }
  }

  // Format time for display
  const formatTime = (dateTimeStr: string | undefined) => {
    if (!dateTimeStr) return "-"

    const date = new Date(dateTimeStr)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">any for {userData.username}</h2>
        <button
          onClick={() => setIsAttendanceFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add any
        </button>
      </div>

      {/* any table */}
      <div className="relative overflow-x-auto">
        {attendanceData.length === 0 ? (
          <p className="text-center text-lg mt-10">No attendance records found</p>
        ) : (
          <table className="w-full bg-white border-collapse border border-slate-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
             {attendanceData.map((attendance) => (
                <tr key={attendance.attendanceId} className="hover:bg-gray-50">
                  <td className="border border-slate-300 px-6 py-4 whitespace-nowrap">
                    {new Date(attendance.date).toLocaleDateString()}
                  </td>
                  <td className="border border-slate-300 px-6 py-4 whitespace-nowrap">
                    {formatStatus(attendance.status)}
                  </td>
                  <td className="border border-slate-300 px-6 py-4 whitespace-nowrap">
                    {formatTime(attendance.checkInTime?.toString())}
                  </td>
                  <td className="border border-slate-300 px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {formatTime(attendance.checkOutTime?.toString())}
                      {canCheckOut(attendance) && (
                        <span className="text-orange-600 text-sm font-medium">(Pending)</span>
                      )}
                    </div>
                  </td>
                  <td className="border border-slate-300 px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {canCheckOut(attendance) && (
                        <button
                          onClick={() => openCheckOutModal(attendance)}
                          className="text-green-600 hover:text-green-800 hover:underline"
                        >
                          Check Out
                        </button>
                      )}
                      {canUpdateCheckOut(attendance) && (
                        <button
                          onClick={() => openCheckOutModal(attendance)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Update
                        </button>
                      )}
                      <button
                        onClick={() => openDeleteModal(attendance)}
                        className="text-red-600 hover:text-red-800 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))} 
            </tbody>
          </table>
        )}
      </div>

      {/* Add any Form Modal */}
      {isAttendanceFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{"addAttendance"}</h3>
              <button onClick={closeModals} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300">
                X
              </button>
            </div>

            <form onSubmit={handleAddAttendance}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as AttendanceStatus)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value={AttendanceStatus.PRESENT}>Present</option>
                  <option value={AttendanceStatus.ABSENT}>Absent</option>
                  <option value={AttendanceStatus.ON_LEAVE}>On Leave</option>
                </select>
              </div>

              {selectedStatus === AttendanceStatus.PRESENT && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Check In Time <span className="text-gray-500 text-xs">(Check-out can be added later)</span>
                  </label>
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check Out Form Modal */}
      {isCheckOutFormOpen && selectedAttendance && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedAttendance.checkOutTime ? 'Update Check-out Time' : 'Add Check-out Time'}
              </h3>
              <button onClick={closeModals} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300">
                X
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <strong>Date:</strong> {new Date(selectedAttendance.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Check In:</strong> {formatTime(selectedAttendance.checkInTime?.toString())}
              </p>
              {selectedAttendance.checkOutTime && (
                <p className="text-sm text-gray-600">
                  <strong>Current Check Out:</strong> {formatTime(selectedAttendance.checkOutTime.toString())}
                </p>
              )}
            </div>

            <form onSubmit={handleCheckOut}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {selectedAttendance.checkOutTime ? 'New Check Out Time' : 'Check Out Time'}
                </label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  {selectedAttendance.checkOutTime ? 'Update' : 'Check Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedAttendance && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeModals}
          onConfirm={handleDeleteConfirm}
          title="Delete any Record"
          message={`Are you sure you want to delete the attendance record for ${new Date(selectedAttendance.date).toLocaleDateString()}?`}
        />
      )}
    </div>
  )
}