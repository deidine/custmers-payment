"use client";
import { useEffect, useState } from "react";
import type React from "react";

import toast from "react-hot-toast";
import { addDays, format } from "date-fns"; // Correctly import format

import type {  User } from "@/types/user";
import { AttendanceStatus } from "@/types/user";
import { useScrollLock } from "@/hooks/useScrollLock";
import DeleteModal from "../DeleteModal";

interface AttendanceTableProps {
  userData: User;
  onRefresh: () => void; // This typically means re-fetching data for the parent component, useful for overall refresh
}
 

export default function UserAttendanceModel({
  userData,
  onRefresh,
}: AttendanceTableProps) {
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<any | null>(null);
  const [isAttendanceFormOpen, setIsAttendanceFormOpen] = useState(false);
  const [isCheckOutFormOpen, setIsCheckOutFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(
    AttendanceStatus.PRESENT
  );
  const [checkInTime, setCheckInTime] = useState<string>("");
  const [checkOutTime, setCheckOutTime] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  // Calculate default start and end of current month
  const today = new Date();
  const todayFormatted = format(today, "yyyy-MM-dd");
  const twoDaysFromToday = format(addDays(today, 2), "yyyy-MM-dd");

  // State for date range filtering
  const [dateRange, setDateRange] = useState({
    startDate: todayFormatted, // Set startDate to today's formatted date
    endDate: twoDaysFromToday,
  });
  // Lock scroll when any modal is open
  useScrollLock(
    isDeleteModalOpen || isAttendanceFormOpen || isCheckOutFormOpen
  );

  // --- Fetch any Data ---
  const fetchAttendanceData = async () => {
    if (!userData || !userData.userId) {
      console.warn("User data or userId is missing, cannot fetch attendance.");
      setAttendanceData([]); // Clear data if user data is missing
      return;
    }

    // const toastId = toast.loading("Fetching attendance...");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/users/${userData.userId}/attendance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch attendance data");
      }

      const data = await response.json();
      // Assuming `data.result` is an array of any records
      setAttendanceData(data.result || []);
      // toast.success("any data loaded.")
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error fetching attendance data"
      );
      setAttendanceData([]); // Ensure data is cleared on error
    } finally {
      // toast.dismiss(toastId);
    }
  };

  // Effect to fetch data when userData or dateRange changes
  useEffect(() => {
    fetchAttendanceData();
  }, [userData.userId, dateRange.startDate, dateRange.endDate]); // Dependencies ensure refetch on change

  const handleDeleteConfirm = async () => {
    if (!selectedAttendance) return;

    // const toastId = toast.loading("Deleting attendance record...");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/attendance/${selectedAttendance.attendanceId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      // toast.success("any record deleted successfully");
      closeModals();
      fetchAttendanceData(); // Re-fetch attendance after deletion
      onRefresh(); // Trigger parent refresh if needed
    } catch (error) {
      console.error("Failed to delete attendance:", error);
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      // toast.dismiss(toastId);
    }
  };

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault();

    // const toastId = toast.loading("Adding attendance record...");

    try {
      const attendancePayload = {
        userId: userData.userId,
        date: selectedDate,
        status: selectedStatus,
        // Only include checkInTime for PRESENT status, and only when provided
        checkInTime:
          selectedStatus === AttendanceStatus.PRESENT && checkInTime
            ? new Date(`${selectedDate}T${checkInTime}:00`).toISOString()
            : undefined,
        checkOutTime: undefined, // Ensure this is not sent on initial creation unless explicitly designed
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attendancePayload),
        }
      );

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      // toast.success("any record added successfully");
      setIsAttendanceFormOpen(false);
      resetForm();
      fetchAttendanceData(); // Re-fetch attendance after adding
      onRefresh();
    } catch (error) {
      console.error("Failed to add attendance:", error);
      // toast.error(error instanceof Error ? error.message : "Add failed");
    } finally {
      // toast.dismiss(toastId);
    }
  };

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAttendance) {
      toast.error("noAttendanceRecordSelected");
      return;
    }
    if (!checkOutTime) {
      toast.error("Check-out time is required.");
      return;
    }

    const toastId = toast.loading("Updating check-out time...");

    try {
      // Use existing checkInTime, format it correctly as ISO string if it exists
      const existingCheckIn = selectedAttendance.checkInTime
        ? new Date(selectedAttendance.checkInTime).toISOString()
        : undefined;

      const updatePayload = {
        attendanceId: selectedAttendance.attendanceId, // ID is crucial for PUT/PATCH
        userId: userData.userId, // Include userId for verification if needed by backend
        date: selectedAttendance.date, // Retain original date
        status: selectedAttendance.status, // Retain original status
        checkInTime: existingCheckIn, // Use the existing check-in time
        checkOutTime: new Date(
          `${typeof selectedAttendance.date === "string" ? String(selectedAttendance.date).split("T")[0] : format(selectedAttendance.date as Date, "yyyy-MM-dd")}T${checkOutTime}:00`
        ).toISOString(), // New checkout time
      };

      // Use PUT or PATCH for updating existing resources, including the ID in the URL
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/attendance/${selectedAttendance.attendanceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      toast.success("Check-out time updated successfully");
      closeModals();
      fetchAttendanceData(); // Re-fetch attendance after updating
      onRefresh();
    } catch (error) {
      console.error("Failed to update check-out time:", error);
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const openDeleteModal = (attendance: any) => {
    setSelectedAttendance(attendance);
    setIsDeleteModalOpen(true);
  };
  const resetForm = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedStatus(AttendanceStatus.PRESENT);
    setCheckInTime("");
    setCheckOutTime("");
  };

  const openCheckOutModal = (attendance: any) => {
    setSelectedAttendance(attendance);
    // Pre-fill checkOutTime if already present for editing, otherwise leave empty
    setCheckOutTime(
      attendance.checkOutTime
        ? format(new Date(attendance.checkOutTime), "HH:mm")
        : ""
    );
    setIsCheckOutFormOpen(true);
  };

  const closeModals = () => {
    setIsDeleteModalOpen(false);
    setIsAttendanceFormOpen(false);
    setIsCheckOutFormOpen(false);
    setSelectedAttendance(null);
  };

  // Check if attendance record can be checked out
  const canCheckOut = (attendance: any) => {
    return (
      attendance.status === AttendanceStatus.PRESENT &&
      attendance.checkInTime &&
      !attendance.checkOutTime
    );
  };

  // Check if attendance record can be updated (already has check-out time)
  const canUpdateCheckOut = (attendance: any) => {
    return (
      attendance.status === AttendanceStatus.PRESENT &&
      attendance.checkInTime &&
      attendance.checkOutTime
    );
  };

  // Format attendance status for display
  const formatStatus = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return (
          <div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              {"present"}
            </span>
           
            
          </div>
        );
      case AttendanceStatus.ON_LEAVE:
        return (
         <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              {"onLeave"}
            </span>
        );
        case AttendanceStatus.ABSENT:
        return (
           <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
              {"absent"}
            </span>
        )
      default:
        return status;
    }
  };

  // Format time for display
  const formatTime = (dateTimeStr: string | undefined) => {
    if (!dateTimeStr) return "-";

    try {
      const date = new Date(dateTimeStr);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "-"; // Invalid date
      }
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting time:", e);
      return "-";
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
         <div className="flex justify-between items-center mb-6">
         <span>  any for {userData.username}
          </span>

             <img
          src={userData.profilePictureUrl || "/placeholder.svg"}
          alt="Profile Preview"
          className="w-20 h-20 object-cover"
        />
         </div>
        </h2>
        <button
          onClick={() => setIsAttendanceFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          {('addAttendance')}
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6 flex items-center space-x-4 p-4 bg-gray-50 rounded-lg shadow-sm">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            {"startDate"}
          </label>
          <input
            type="date"
            id="startDate"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
            className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700"
          >
            {"endDate"}
          </label>
          <input
            type="date"
            id="endDate"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, endDate: e.target.value })
            }
            className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm"
          />
        </div>
        <button
          onClick={fetchAttendanceData} // Trigger fetch when button is clicked
          className="mt-5 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200 self-end"
        >
          {"applyFilter"}
        </button>
      </div>

      {/* any table */}
      <div className="relative overflow-x-auto border border-slate-300 rounded-lg shadow-md">
        {attendanceData.length === 0 ? (
          <p className="text-center text-lg mt-10 py-8 text-gray-600">
            {"noAttendanceRecordsFound"}
          </p>
        ) : (
          <table className="w-full bg-white border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {"date"}
                </th>
                <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {"status"}
                </th>
                <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {"checkIn"}
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
                <tr
                  key={attendance.attendanceId}
                  className="hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(attendance.date).toLocaleDateString()}
                  </td>
                  <td className="border border-slate-300 px-6 py-4 whitespace-nowrap">
                    {formatStatus(attendance.status)}
                  </td>
                  <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatTime(attendance.checkInTime)}
                  </td>
                  <td className="border border-slate-300 px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      {formatTime(attendance.checkOutTime)}
                      {canCheckOut(attendance) && (
                        <span className="text-orange-600 text-xs font-medium">
                          {"pending"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="border border-slate-300 px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {canCheckOut(attendance) && (
                        <button
                          onClick={() => openCheckOutModal(attendance)}
                          className="text-green-600 hover:text-green-800 hover:underline text-sm font-medium"
                        >
                          {"checkOut"}
                        </button>
                      )}
                      {canUpdateCheckOut(attendance) && (
                        <button
                          onClick={() => openCheckOutModal(attendance)}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                        >
                          {"update"}
                        </button>
                      )}
                      <button
                        onClick={() => openDeleteModal(attendance)}
                        className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                      >
                        {"delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex justify-start mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Replace with attendance view route
            window.location.href = `/dashboard/attendance/${userData.userId}`;
          }}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
        >
          {"showAllAttendance"}
        </button>
      </div>
      {/* Add any Form Modal */}
      {isAttendanceFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {"addAttendanceRecord"}
              </h3>
              <button
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>X
              </button>
            </div>

            <form onSubmit={handleAddAttendance}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="attendance-date"
                >
                  {"date"}
                </label>
                <input
                  type="date"
                  id="attendance-date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="attendance-status"
                >
                  {"status"}
                </label>
                <select
                  id="attendance-status"
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as AttendanceStatus)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={AttendanceStatus.PRESENT}>{"present"}</option>
                  <option value={AttendanceStatus.ABSENT}>{"absent"}</option>
                  <option value={AttendanceStatus.ON_LEAVE}>{"onLeave"}</option>
                </select>
              </div>

              {selectedStatus === AttendanceStatus.PRESENT && (
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="check-in-time"
                  >
                    Check In Time{" "}
                    <span className="text-gray-500 text-xs font-normal">
                      (Check-out can be added later)
                    </span>
                  </label>
                  <input
                    type="time"
                    id="check-in-time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check Out Form Modal */}
      {isCheckOutFormOpen && selectedAttendance && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedAttendance.checkOutTime
                  ? "Update Check-out Time"
                  : "Add Check-out Time"}
              </h3>
              <button
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>X
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Date:</strong>{" "}
                {new Date(selectedAttendance.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Check In:</strong>{" "}
                {formatTime(selectedAttendance.checkInTime)}
              </p>
              {selectedAttendance.checkOutTime && (
                <p className="text-sm text-gray-600">
                  <strong>Current Check Out:</strong>{" "}
                  {formatTime(selectedAttendance.checkOutTime)}
                </p>
              )}
            </div>

            <form onSubmit={handleCheckOut}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="check-out-time-input"
                >
                  {selectedAttendance.checkOutTime
                    ? "New Check Out Time"
                    : "Check Out Time"}
                </label>
                <input
                  type="time"
                  id="check-out-time-input"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                >
                  {selectedAttendance.checkOutTime ? "Update" : "Check Out"}
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
          message={`Are you sure you want to delete the attendance record for ${new Date(
            selectedAttendance.date
          ).toLocaleDateString()}? This action cannot be undone.`}
        />
      )}
    </div>
  );
}
