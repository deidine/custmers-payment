"use client"
import { useState, useEffect } from "react"
import type { User, AttendanceSummary } from "@/types/user"

interface AttendanceSummaryTableProps {
  userData: User
  summaryData: AttendanceSummary[]
}

export default function AttendanceSummaryTable({ userData, summaryData }: AttendanceSummaryTableProps) {
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear())
  const [filteredData, setFilteredData] = useState<AttendanceSummary[]>([])

  // Get available years from the data
  const availableYears = [...new Set(summaryData.map((summary) => summary.year))].sort((a, b) => b - a)

  // Month names for display
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Filter data when year changes
  useEffect(() => {
    const filtered = summaryData.filter((summary) => summary.year === filterYear)
    // Sort by month
    filtered.sort((a, b) => a.month - b.month)
    setFilteredData(filtered)
  }, [filterYear, summaryData])

  // Calculate yearly totals
  const yearlyTotals = {
    presentDays: filteredData.reduce((sum, item) => sum + item.presentDays, 0),
    absentDays: filteredData.reduce((sum, item) => sum + item.absentDays, 0),
    leaveDays: filteredData.reduce((sum, item) => sum + item.leaveDays, 0),
    total: filteredData.reduce((sum, item) => sum + item.presentDays + item.absentDays + item.leaveDays, 0),
  }

  // Calculate attendance percentage
  const attendancePercentage =
    yearlyTotals.total > 0 ? Math.round((yearlyTotals.presentDays / yearlyTotals.total) * 100) : 0

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Attendance Summary for {userData.username}</h2>

        {/* Year filter */}
        <div className="flex items-center gap-3 mb-4">
          <label className="text-gray-700 font-medium">Year:</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="border rounded px-3 py-1"
          >
            {availableYears.length > 0 ? (
              availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))
            ) : (
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            )}
          </select>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Present Days</p>
            <p className="text-2xl font-bold">{yearlyTotals.presentDays}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Absent Days</p>
            <p className="text-2xl font-bold">{yearlyTotals.absentDays}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Leave Days</p>
            <p className="text-2xl font-bold">{yearlyTotals.leaveDays}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Attendance Rate</p>
            <p className="text-2xl font-bold">{attendancePercentage}%</p>
          </div>
        </div>
      </div>

      {/* Monthly summary table */}
      <div className="overflow-x-auto">
        {filteredData.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No attendance data available for {filterYear}</p>
        ) : (
          <table className="min-w-full bg-white border-collapse border border-slate-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Present Days
                </th>
                <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Absent Days
                </th>
                <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Leave Days
                </th>
                <th className="border border-slate-300 px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Attendance %
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((summary) => {
                const totalDays = summary.presentDays + summary.absentDays + summary.leaveDays
                const percentage = totalDays > 0 ? Math.round((summary.presentDays / totalDays) * 100) : 0

                return (
                  <tr key={`${summary.year}-${summary.month}`} className="hover:bg-gray-50">
                    <td className="border border-slate-300 px-6 py-4 whitespace-nowrap font-medium">
                      {monthNames[summary.month - 1]}
                    </td>
                    <td className="border border-slate-300 px-6 py-4 whitespace-nowrap">{summary.presentDays}</td>
                    <td className="border border-slate-300 px-6 py-4 whitespace-nowrap">{summary.absentDays}</td>
                    <td className="border border-slate-300 px-6 py-4 whitespace-nowrap">{summary.leaveDays}</td>
                    <td className="border border-slate-300 px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-2">{percentage}%</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              percentage >= 90 ? "bg-green-500" : percentage >= 75 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {/* Yearly total row */}
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td className="border border-slate-300 px-6 py-3 whitespace-nowrap">Total for {filterYear}</td>
                <td className="border border-slate-300 px-6 py-3 whitespace-nowrap">{yearlyTotals.presentDays}</td>
                <td className="border border-slate-300 px-6 py-3 whitespace-nowrap">{yearlyTotals.absentDays}</td>
                <td className="border border-slate-300 px-6 py-3 whitespace-nowrap">{yearlyTotals.leaveDays}</td>
                <td className="border border-slate-300 px-6 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-2">{attendancePercentage}%</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          attendancePercentage >= 90
                            ? "bg-green-500"
                            : attendancePercentage >= 75
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${attendancePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
