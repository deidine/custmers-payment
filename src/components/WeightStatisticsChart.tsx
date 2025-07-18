"use client"
import { forwardRef, useImperativeHandle, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatDate } from "@/utils/helpers"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import toast from "react-hot-toast"

interface WeightStatisticsChartProps {
  attendanceData: {
    date: string
    poids_now: number
  }[]
  startDate?: string // New prop for start date
  endDate?: string // New prop for end date
}

export interface WeightStatisticsChartRef {
  generatePdf: () => Promise<void>
}

const WeightStatisticsChart = forwardRef<WeightStatisticsChartRef, WeightStatisticsChartProps>(
  ({ attendanceData, startDate, endDate }, ref) => {
    const chartContainerRef = useRef<HTMLDivElement>(null)

    // Filter attendance data by date range
    const filteredData = attendanceData.filter((item) => {
      const itemDate = new Date(item.date)
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      // Adjust end date to include the entire day
      if (end) {
        end.setHours(23, 59, 59, 999)
      }

      return (!start || itemDate >= start) && (!end || itemDate <= end)
    })

    // Sort filtered data by date to ensure correct chart display
    const sortedData = [...filteredData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Format data for the chart, ensuring unique dates if multiple entries exist for a day
    const chartData = sortedData.map((item) => ({
      date: formatDate(item.date), // Format date for display on X-axis
      weight: item.poids_now,
    }))

    useImperativeHandle(ref, () => ({
      generatePdf: async () => {
        if (!chartContainerRef.current) {
          toast.error("Chart element not found for PDF generation.")
          return
        }

        const toastId = toast.loading("Generating PDF...")
        try {
          const canvas = await html2canvas(chartContainerRef.current, {
            scale: 2, // Increase scale for better quality
            useCORS: true, // Important for images if any
          })

          const imgData = canvas.toDataURL("image/png")
          const pdf = new jsPDF("p", "mm", "a4") // Portrait, millimeters, A4 size
          const imgWidth = 200 // A4 width is 210mm, leave some margin
          const pageHeight = 295 // A4 height is 297mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width

          let position = 10 // Initial Y position

          // Add title
          pdf.setFontSize(18)
          pdf.text("Client Weight Advancement Report", 10, position)
          position += 10

          // Add date range
          pdf.setFontSize(10)
          pdf.text(`Date Range: ${startDate || "N/A"} to ${endDate || "N/A"}`, 10, position)
          position += 10

          // Add chart image
          pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight)

          pdf.save(`Weight_Report_${formatDate(new Date().toISOString())}.pdf`)
          toast.success("PDF generated successfully!", { id: toastId })
        } catch (error) {
          console.error("Error generating PDF:", error)
          toast.error("Failed to generate PDF.", { id: toastId })
        }
      },
    }))

    return (
      <div
        ref={chartContainerRef}
        className="h-[400px] w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `${value} kg`} tick={{ fill: "#6b7280", fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => `${value} kg`}
                labelFormatter={(label: string) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "0.5rem",
                  padding: "0.5rem",
                }}
                labelStyle={{ color: "#374151", fontWeight: "bold" }}
                itemStyle={{ color: "#1f2937" }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#4f46e5" // A nice purple/indigo
                strokeWidth={2}
                dot={{ stroke: "#4f46e5", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "#4f46e5",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No weight data available for the selected date range.
          </div>
        )}
      </div>
    )
  },
)

WeightStatisticsChart.displayName = "WeightStatisticsChart"

export default WeightStatisticsChart
